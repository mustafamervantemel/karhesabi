const express = require('express');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const cors = require('cors');
const https = require('https');
const path = require('path');
require('dotenv').config();

const app = express();

// Production için güvenlik ayarları
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://karhesabi.vercel.app', 
      'https://www.karhesabi.vercel.app',
      'https://karhesabi-git-main-mcts-projects-2b8b6936.vercel.app',
      'https://karhesabi-mcts-projects-2b8b6936.vercel.app',
      'http://localhost:3000', 
      'http://127.0.0.1:3000', 
      'http://localhost:5173', 
      'http://127.0.0.1:5173',
      'http://192.168.1.51:3000',
      'http://192.168.1.51:5173',
      'http://167.71.42.27:3000',
      'http://167.71.42.27:5173',
      'https://167.71.42.27:3000',
      'http://167.71.42.27:4000',
      'https://167.71.42.27:4000',
      'https://167.71.42.27:5173'
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, false);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Access-Control-Allow-Origin']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// TLS 1.2+ için agent
const httpsAgent = new https.Agent({
  minVersion: 'TLSv1.2',
  maxVersion: 'TLSv1.3'
});

// Trendyol API base URL - Test/Production ortamına göre
const TRENDYOL_BASE_URL = process.env.TRENDYOL_ENV === 'production' 
  ? 'https://apigw.trendyol.com'
  : process.env.TRENDYOL_ENV === 'test' 
    ? 'https://stageapigw.trendyol.com'
    : process.env.NODE_ENV === 'production' 
      ? 'https://apigw.trendyol.com'
      : 'https://stageapigw.trendyol.com';

// Helper: Trendyol'a istek at
async function makeTrendyolRequest(endpoint, options = {}) {
  let url = `${TRENDYOL_BASE_URL}${endpoint}`;
  
  // Query parametrelerini URL'e ekle
  if (options.params) {
    const queryParams = new URLSearchParams();
    Object.keys(options.params).forEach(key => {
      if (options.params[key] !== null && options.params[key] !== undefined) {
        queryParams.append(key, options.params[key]);
      }
    });
    const queryString = queryParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }
  
  console.log('Trendyol API URL:', url);
  const userAgent = options.sellerId
    ? `${options.sellerId} - SelfIntegration`
    : 'SelfIntegration';
  const headers = {
    Authorization: `Basic ${Buffer.from(`${options.apiKey}:${options.apiSecret}`).toString('base64')}`,
    'Content-Type': 'application/json',
    'User-Agent': userAgent
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
  if (!apiKey || !apiSecret) {
    return res.status(400).json({ success: false, error: 'API Key ve API Secret gerekli' });
  }
  try {
    const info = await makeTrendyolRequest(`/sapigw/suppliers`, { apiKey, apiSecret });
    const sellerInfo = Array.isArray(info) ? info[0] : info;
    res.json({ success: true, sellerInfo });
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
    const info = await makeTrendyolRequest('/sapigw/suppliers', { apiKey, apiSecret });
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
      `/sapigw/suppliers/${sellerId}/products`,
      { apiKey, apiSecret, params: { page, size } }
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
    let endpoint = `/sapigw/suppliers/${sellerId}/orders`;
    const params = { page, size };
    if (status) params.status = status;
    const orders = await makeTrendyolRequest(endpoint, { apiKey, apiSecret, params });
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
      `/sapigw/suppliers/${sellerId}/products/stock-updates`,
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
      `/sapigw/suppliers/${sellerId}/products/price-updates`,
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
    const categories = await makeTrendyolRequest('/sapigw/product-categories', { apiKey, apiSecret });
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
      `/sapigw/suppliers/${sellerId}/shipment-providers`,
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
      `/sapigw/suppliers/${sellerId}/orders/${orderId}/status`,
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
      `/sapigw/suppliers/${sellerId}/orders/${orderId}/shipment`,
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

// Debug endpoint for Trendyol API testing
app.get('/api/trendyol/debug', (req, res) => {
  const { apiKey, apiSecret } = req.query;
  
  if (!apiKey || !apiSecret) {
    return res.json({
      error: 'API Key ve API Secret gerekli',
      endpoint: TRENDYOL_BASE_URL,
      env: process.env.TRENDYOL_ENV,
      nodeEnv: process.env.NODE_ENV,
      requestExample: {
        url: `${TRENDYOL_BASE_URL}/sapigw/suppliers`,
        headers: {
          'Authorization': 'Basic [base64_encoded_credentials]',
          'Content-Type': 'application/json',
          'User-Agent': 'SelfIntegration'
        }
      }
    });
  }
  
  // Test basic auth encoding
  const credentials = `${apiKey}:${apiSecret}`;
  const encodedCredentials = Buffer.from(credentials, 'utf8').toString('base64');
  
  res.json({
    debug: 'Trendyol API Debug Info',
    endpoint: TRENDYOL_BASE_URL,
    environment: process.env.TRENDYOL_ENV,
    nodeEnv: process.env.NODE_ENV,
    apiKeyLength: apiKey.length,
    apiSecretLength: apiSecret.length,
    encodedCredentials: encodedCredentials,
    testUrl: `${TRENDYOL_BASE_URL}/sapigw/suppliers`,
    curlCommand: `curl -X GET "${TRENDYOL_BASE_URL}/sapigw/suppliers" \\
  -H "Authorization: Basic ${encodedCredentials}" \\
  -H "Content-Type: application/json" \\
  -H "User-Agent: SelfIntegration" \\
  -v`
  });
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
  console.log(`🌐 Server accessible at: http://192.168.1.51:${PORT}`);
  console.log(`🔧 Environment: ${process.env.TRENDYOL_ENV || 'development'}`);
  console.log(`📡 Trendyol API: ${TRENDYOL_BASE_URL}`);
});
