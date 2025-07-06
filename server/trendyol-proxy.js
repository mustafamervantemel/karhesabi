const express = require('express');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const cors = require('cors');
const https = require('https');
const path = require('path');
require('dotenv').config();

const app = express();

// Production için güvenlik ayarları
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://karhesabi.vercel.app', 'https://www.karhesabi.vercel.app']
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// TLS 1.2+ için agent
const httpsAgent = new https.Agent({
  minVersion: 'TLSv1.2',
  maxVersion: 'TLSv1.3'
});

// Trendyol API base URL - Production/Stage ortamına göre
const TRENDYOL_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.trendyol.com/sapigw'
  : 'https://stageapigw.trendyol.com';

// Helper: Trendyol'a istek at
async function makeTrendyolRequest(endpoint, options = {}) {
  const url = `${TRENDYOL_BASE_URL}${endpoint}`;
  console.log('Trendyol API URL:', url);
  const userAgent = options.sellerId
    ? `${options.sellerId} - SelfIntegration`
    : 'SelfIntegration';
  const headers = {
    Authorization: `Basic ${Buffer.from(`${options.apiKey}:${options.apiSecret}`).toString('base64')}`,
    'Content-Type': 'application/json',
    'User-Agent': userAgent,
    ...options.headers
  };

  const fetchOptions = {
    method: options.method || 'GET',
    headers,
    agent: httpsAgent,
    ...(options.body && { body: JSON.stringify(options.body) })
  };

  const response = await fetch(url, fetchOptions);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Trendyol API Error: ${response.status} – ${data.message || response.statusText}`);
  }
  return data;
}

// Connection test
app.post('/api/trendyol/test-connection', async (req, res) => {
  const { apiKey, apiSecret, sellerId } = req.body;
  if (!apiKey || !apiSecret || !sellerId) {
    return res.status(400).json({ success: false, error: 'API Key, API Secret ve Seller ID gerekli' });
  }
  try {
    const info = await makeTrendyolRequest(`/suppliers`, { apiKey, apiSecret });
    res.json({ success: true, sellerInfo: info[0] || info });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Supplier info
app.get('/api/trendyol/seller-info', async (req, res) => {
  const { apiKey, apiSecret } = req.query;
  if (!apiKey || !apiSecret) {
    return res.status(400).json({ success: false, error: 'API Key ve API Secret gerekli' });
  }
  try {
    const info = await makeTrendyolRequest('/suppliers', { apiKey, apiSecret });
    res.json({ success: true, sellerInfo: info[0] || info });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Products
app.get('/api/trendyol/products', async (req, res) => {
  const { apiKey, apiSecret, sellerId, page = 0, size = 50 } = req.query;
  if (!apiKey || !apiSecret || !sellerId) {
    return res.status(400).json({ success: false, error: 'API Key, API Secret ve Seller ID gerekli' });
  }
  try {
    const products = await makeTrendyolRequest(
      `/suppliers/${sellerId}/products`,
      { apiKey, apiSecret, headers: { page, size } }
    );
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Orders
app.get('/api/trendyol/orders', async (req, res) => {
  const { apiKey, apiSecret, sellerId, page = 0, size = 50, status } = req.query;
  if (!apiKey || !apiSecret || !sellerId) {
    return res.status(400).json({ success: false, error: 'API Key, API Secret ve Seller ID gerekli' });
  }
  try {
    let endpoint = `/suppliers/${sellerId}/orders`;
    if (status) endpoint += `?status=${status}`;
    const orders = await makeTrendyolRequest(endpoint, { apiKey, apiSecret, headers: { page, size } });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Stock update
app.post('/api/trendyol/update-stock', async (req, res) => {
  const { apiKey, apiSecret, sellerId, stockUpdates } = req.body;
  if (!apiKey || !apiSecret || !sellerId || !stockUpdates) {
    return res.status(400).json({ success: false, error: 'API Key, API Secret, Seller ID ve stockUpdates gerekli' });
  }
  try {
    const result = await makeTrendyolRequest(
      `/suppliers/${sellerId}/products/stock-updates`,
      { method: 'POST', apiKey, apiSecret, body: { items: stockUpdates } }
    );
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Price update
app.post('/api/trendyol/update-price', async (req, res) => {
  const { apiKey, apiSecret, sellerId, priceUpdates } = req.body;
  if (!apiKey || !apiSecret || !sellerId || !priceUpdates) {
    return res.status(400).json({ success: false, error: 'API Key, API Secret, Seller ID ve priceUpdates gerekli' });
  }
  try {
    const result = await makeTrendyolRequest(
      `/suppliers/${sellerId}/products/price-updates`,
      { method: 'POST', apiKey, apiSecret, body: { items: priceUpdates } }
    );
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Categories
app.get('/api/trendyol/categories', async (req, res) => {
  const { apiKey, apiSecret } = req.query;
  if (!apiKey || !apiSecret) {
    return res.status(400).json({ success: false, error: 'API Key ve API Secret gerekli' });
  }
  try {
    const categories = await makeTrendyolRequest('/product-categories', { apiKey, apiSecret });
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Shipment providers
app.get('/api/trendyol/shipment-providers', async (req, res) => {
  const { apiKey, apiSecret, sellerId } = req.query;
  if (!apiKey || !apiSecret || !sellerId) {
    return res.status(400).json({ success: false, error: 'API Key, API Secret ve Seller ID gerekli' });
  }
  try {
    const providers = await makeTrendyolRequest(
      `/suppliers/${sellerId}/shipment-providers`,
      { apiKey, apiSecret }
    );
    res.json({ success: true, providers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update order status
app.put('/api/trendyol/update-order-status', async (req, res) => {
  const { apiKey, apiSecret, sellerId, orderId, status } = req.body;
  if (!apiKey || !apiSecret || !sellerId || !orderId || !status) {
    return res.status(400).json({ success: false, error: 'API Key, API Secret, Seller ID, orderId ve status gerekli' });
  }
  try {
    const result = await makeTrendyolRequest(
      `/suppliers/${sellerId}/orders/${orderId}/status`,
      { method: 'PUT', apiKey, apiSecret, body: { status } }
    );
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create shipment
app.post('/api/trendyol/create-shipment', async (req, res) => {
  const { apiKey, apiSecret, sellerId, orderId, shipmentData } = req.body;
  if (!apiKey || !apiSecret || !sellerId || !orderId || !shipmentData) {
    return res.status(400).json({ success: false, error: 'API Key, API Secret, Seller ID, orderId ve kargo bilgileri gerekli' });
  }
  try {
    const result = await makeTrendyolRequest(
      `/suppliers/${sellerId}/orders/${orderId}/shipment`,
      { method: 'POST', apiKey, apiSecret, body: shipmentData }
    );
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Statik dosyaları sun
app.use(express.static(path.join(__dirname, '../dist')));

// Sadece API dışındaki GET isteklerini frontend'e yönlendir
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Trendyol Proxy Server running on port ${PORT}`);
});
