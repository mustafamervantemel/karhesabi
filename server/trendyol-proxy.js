const express = require('express');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const cors = require('cors');
const https = require('https');

const app = express();
app.use(cors());
app.use(express.json());

// TLS 1.2 ve üzeri için agent oluştur
const httpsAgent = new https.Agent({
  minVersion: 'TLSv1.2',
  maxVersion: 'TLSv1.3'
});

// Trendyol API base URL
const TRENDYOL_BASE_URL = 'https://api.trendyol.com/sapigw';

// API isteği gönder helper fonksiyonu
async function makeTrendyolRequest(endpoint, options = {}) {
  const url = `${TRENDYOL_BASE_URL}${endpoint}`;
  const headers = {
    'Authorization': `Basic ${Buffer.from(`${options.apiKey}:${options.apiSecret}`).toString('base64')}`,
    'Content-Type': 'application/json',
    'User-Agent': 'KarHesap/1.0.0',
    ...options.headers
  };

  const fetchOptions = {
    method: options.method || 'GET',
    headers,
    agent: httpsAgent,
    ...(options.body && { body: JSON.stringify(options.body) })
  };

  try {
    const response = await fetch(url, fetchOptions);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Trendyol API Error: ${response.status} - ${data.message || response.statusText}`);
    }
    
    return data;
  } catch (error) {
    console.error('Trendyol API Request Error:', error);
    throw error;
  }
}

// Bağlantı testi
app.post('/api/trendyol/test-connection', async (req, res) => {
  const { sellerId, integrationCode, apiKey, apiSecret } = req.body;

  if (!apiKey || !apiSecret) {
    return res.status(400).json({ 
      success: false, 
      error: 'API Key ve API Secret gereklidir' 
    });
  }

  try {
    // Seller bilgilerini al
    const sellerInfo = await makeTrendyolRequest('/suppliers', {
      apiKey,
      apiSecret
    });

    res.json({ 
      success: true, 
      sellerInfo: sellerInfo[0] || sellerInfo,
      message: 'Trendyol API bağlantısı başarılı'
    });
  } catch (err) {
    console.error('Connection test error:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message || 'Bağlantı testi başarısız'
    });
  }
});

// Seller bilgilerini al
app.get('/api/trendyol/seller-info', async (req, res) => {
  const { apiKey, apiSecret } = req.query;

  if (!apiKey || !apiSecret) {
    return res.status(400).json({ 
      success: false, 
      error: 'API Key ve API Secret gereklidir' 
    });
  }

  try {
    const sellerInfo = await makeTrendyolRequest('/suppliers', {
      apiKey,
      apiSecret
    });

    res.json({ 
      success: true, 
      sellerInfo: sellerInfo[0] || sellerInfo
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Ürünleri listele
app.get('/api/trendyol/products', async (req, res) => {
  const { apiKey, apiSecret, sellerId, page = 0, size = 50 } = req.query;

  if (!apiKey || !apiSecret || !sellerId) {
    return res.status(400).json({ 
      success: false, 
      error: 'API Key, API Secret ve Seller ID gereklidir' 
    });
  }

  try {
    const products = await makeTrendyolRequest(`/suppliers/${sellerId}/products`, {
      apiKey,
      apiSecret,
      headers: {
        'page': page,
        'size': size
      }
    });

    res.json({ 
      success: true, 
      products 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Siparişleri listele
app.get('/api/trendyol/orders', async (req, res) => {
  const { apiKey, apiSecret, sellerId, page = 0, size = 50, status } = req.query;

  if (!apiKey || !apiSecret || !sellerId) {
    return res.status(400).json({ 
      success: false, 
      error: 'API Key, API Secret ve Seller ID gereklidir' 
    });
  }

  try {
    let endpoint = `/suppliers/${sellerId}/orders`;
    if (status) {
      endpoint += `?status=${status}`;
    }

    const orders = await makeTrendyolRequest(endpoint, {
      apiKey,
      apiSecret,
      headers: {
        'page': page,
        'size': size
      }
    });

    res.json({ 
      success: true, 
      orders 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Stok güncelle
app.post('/api/trendyol/update-stock', async (req, res) => {
  const { apiKey, apiSecret, sellerId, stockUpdates } = req.body;

  if (!apiKey || !apiSecret || !sellerId || !stockUpdates) {
    return res.status(400).json({ 
      success: false, 
      error: 'API Key, API Secret, Seller ID ve stok güncellemeleri gereklidir' 
    });
  }

  try {
    const result = await makeTrendyolRequest(`/suppliers/${sellerId}/products/stock-updates`, {
      method: 'POST',
      apiKey,
      apiSecret,
      body: { items: stockUpdates }
    });

    res.json({ 
      success: true, 
      result 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Fiyat güncelle
app.post('/api/trendyol/update-price', async (req, res) => {
  const { apiKey, apiSecret, sellerId, priceUpdates } = req.body;

  if (!apiKey || !apiSecret || !sellerId || !priceUpdates) {
    return res.status(400).json({ 
      success: false, 
      error: 'API Key, API Secret, Seller ID ve fiyat güncellemeleri gereklidir' 
    });
  }

  try {
    const result = await makeTrendyolRequest(`/suppliers/${sellerId}/products/price-updates`, {
      method: 'POST',
      apiKey,
      apiSecret,
      body: { items: priceUpdates }
    });

    res.json({ 
      success: true, 
      result 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Kategorileri listele
app.get('/api/trendyol/categories', async (req, res) => {
  const { apiKey, apiSecret } = req.query;

  if (!apiKey || !apiSecret) {
    return res.status(400).json({ 
      success: false, 
      error: 'API Key ve API Secret gereklidir' 
    });
  }

  try {
    const categories = await makeTrendyolRequest('/product-categories', {
      apiKey,
      apiSecret
    });

    res.json({ 
      success: true, 
      categories 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Kargo sağlayıcılarını listele
app.get('/api/trendyol/shipment-providers', async (req, res) => {
  const { apiKey, apiSecret, sellerId } = req.query;

  if (!apiKey || !apiSecret || !sellerId) {
    return res.status(400).json({ 
      success: false, 
      error: 'API Key, API Secret ve Seller ID gereklidir' 
    });
  }

  try {
    const providers = await makeTrendyolRequest(`/suppliers/${sellerId}/shipment-providers`, {
      apiKey,
      apiSecret
    });

    res.json({ 
      success: true, 
      providers 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Sipariş durumunu güncelle
app.put('/api/trendyol/update-order-status', async (req, res) => {
  const { apiKey, apiSecret, sellerId, orderId, status } = req.body;

  if (!apiKey || !apiSecret || !sellerId || !orderId || !status) {
    return res.status(400).json({ 
      success: false, 
      error: 'API Key, API Secret, Seller ID, Order ID ve Status gereklidir' 
    });
  }

  try {
    const result = await makeTrendyolRequest(`/suppliers/${sellerId}/orders/${orderId}/status`, {
      method: 'PUT',
      apiKey,
      apiSecret,
      body: { status }
    });

    res.json({ 
      success: true, 
      result 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Kargo oluştur
app.post('/api/trendyol/create-shipment', async (req, res) => {
  const { apiKey, apiSecret, sellerId, orderId, shipmentData } = req.body;

  if (!apiKey || !apiSecret || !sellerId || !orderId || !shipmentData) {
    return res.status(400).json({ 
      success: false, 
      error: 'API Key, API Secret, Seller ID, Order ID ve kargo bilgileri gereklidir' 
    });
  }

  try {
    const result = await makeTrendyolRequest(`/suppliers/${sellerId}/orders/${orderId}/shipment`, {
      method: 'POST',
      apiKey,
      apiSecret,
      body: shipmentData
    });

    res.json({ 
      success: true, 
      result 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Trendyol Proxy Server'
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Trendyol Proxy Server running on port ${PORT}`);
  console.log(`📡 TLS 1.2+ support enabled`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
}); 