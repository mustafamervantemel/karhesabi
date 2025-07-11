const https = require('https');

// Use native fetch (Node.js 18+) or fallback to node-fetch
const fetch = globalThis.fetch || require('node-fetch');

// TLS 1.2+ için agent
const httpsAgent = new https.Agent({
  minVersion: 'TLSv1.2',
  maxVersion: 'TLSv1.3'
});

// Trendyol API base URL - Production ortamı
const TRENDYOL_BASE_URL = process.env.TRENDYOL_ENV === 'production' 
  ? 'https://api.trendyol.com'
  : process.env.NODE_ENV === 'production' 
    ? 'https://api.trendyol.com'
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
  
  // Check if response is ok first
  if (!response.ok) {
    let errorMessage = `Trendyol API Error: ${response.status} - ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage += ` - ${errorData.message || JSON.stringify(errorData)}`;
    } catch (e) {
      // If JSON parsing fails, use the response text
      const errorText = await response.text();
      errorMessage += ` - ${errorText}`;
    }
    throw new Error(errorMessage);
  }
  
  // Try to parse JSON response
  try {
    const data = await response.json();
    return data;
  } catch (e) {
    // If JSON parsing fails, return text response
    const textData = await response.text();
    console.warn('Non-JSON response received:', textData);
    return { rawResponse: textData };
  }
}

// CORS ayarları
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
};

// Vercel serverless function
export default async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({}).setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  }

  // Set CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  const { method, query, body } = req;
  const path = req.url.replace('/api/', '');

  try {
    switch (path) {
      case 'trendyol/test-connection':
        if (method !== 'POST') {
          return res.status(405).json({ success: false, error: 'Method not allowed' });
        }
        const { apiKey, apiSecret } = body;
        if (!apiKey || !apiSecret) {
          return res.status(400).json({ success: false, error: 'API Key ve API Secret gerekli' });
        }
        const info = await makeTrendyolRequest(`/suppliers`, { apiKey, apiSecret });
        const sellerInfo = Array.isArray(info) ? info[0] : info;
        return res.json({ success: true, sellerInfo });

      case 'trendyol/seller-info':
        if (method !== 'GET') {
          return res.status(405).json({ success: false, error: 'Method not allowed' });
        }
        const { apiKey: apiKey2, apiSecret: apiSecret2 } = query;
        if (!apiKey2 || !apiSecret2) {
          return res.status(400).json({ success: false, error: 'API Key ve API Secret gerekli' });
        }
        const sellerInfo2 = await makeTrendyolRequest('/suppliers', { apiKey: apiKey2, apiSecret: apiSecret2 });
        return res.json({ success: true, sellerInfo: sellerInfo2[0] || sellerInfo2 });

      case 'trendyol/products':
        if (method !== 'GET') {
          return res.status(405).json({ success: false, error: 'Method not allowed' });
        }
        const { apiKey: apiKey3, apiSecret: apiSecret3, sellerId: sellerId3, page = 0, size = 50 } = query;
        if (!apiKey3 || !apiSecret3 || !sellerId3) {
          return res.status(400).json({ success: false, error: 'API Key, API Secret ve Seller ID gerekli' });
        }
        const products = await makeTrendyolRequest(
          `/suppliers/${sellerId3}/products`,
          { apiKey: apiKey3, apiSecret: apiSecret3, params: { page, size } }
        );
        return res.json({ success: true, products });

      case 'trendyol/orders':
        if (method !== 'GET') {
          return res.status(405).json({ success: false, error: 'Method not allowed' });
        }
        const { apiKey: apiKey4, apiSecret: apiSecret4, sellerId: sellerId4, page: page4 = 0, size: size4 = 50, status } = query;
        if (!apiKey4 || !apiSecret4 || !sellerId4) {
          return res.status(400).json({ success: false, error: 'API Key, API Secret ve Seller ID gerekli' });
        }
        let endpoint = `/suppliers/${sellerId4}/orders`;
        const params = { page: page4, size: size4 };
        if (status) params.status = status;
        const orders = await makeTrendyolRequest(endpoint, { apiKey: apiKey4, apiSecret: apiSecret4, params });
        return res.json({ success: true, orders });

      case 'trendyol/categories':
        if (method !== 'GET') {
          return res.status(405).json({ success: false, error: 'Method not allowed' });
        }
        const { apiKey: apiKey7, apiSecret: apiSecret7 } = query;
        if (!apiKey7 || !apiSecret7) {
          return res.status(400).json({ success: false, error: 'API Key ve API Secret gerekli' });
        }
        const categories = await makeTrendyolRequest('/product-categories', { apiKey: apiKey7, apiSecret: apiSecret7 });
        return res.json({ success: true, categories });

      case 'trendyol/shipment-providers':
        if (method !== 'GET') {
          return res.status(405).json({ success: false, error: 'Method not allowed' });
        }
        const { apiKey: apiKey8, apiSecret: apiSecret8, sellerId: sellerId8 } = query;
        if (!apiKey8 || !apiSecret8 || !sellerId8) {
          return res.status(400).json({ success: false, error: 'API Key, API Secret ve Seller ID gerekli' });
        }
        const providers = await makeTrendyolRequest(
          `/suppliers/${sellerId8}/shipment-providers`,
          { apiKey: apiKey8, apiSecret: apiSecret8 }
        );
        return res.json({ success: true, providers });

      case 'trendyol/update-order-status':
        if (method !== 'PUT') {
          return res.status(405).json({ success: false, error: 'Method not allowed' });
        }
        const { apiKey: apiKey9, apiSecret: apiSecret9, sellerId: sellerId9, orderId, status: orderStatus } = body;
        if (!apiKey9 || !apiSecret9 || !sellerId9 || !orderId || !orderStatus) {
          return res.status(400).json({ success: false, error: 'API Key, API Secret, Seller ID, orderId ve status gerekli' });
        }
        const result3 = await makeTrendyolRequest(
          `/suppliers/${sellerId9}/orders/${orderId}/status`,
          { method: 'PUT', apiKey: apiKey9, apiSecret: apiSecret9, body: { status: orderStatus } }
        );
        return res.json({ success: true, result: result3 });

      case 'trendyol/create-shipment':
        if (method !== 'POST') {
          return res.status(405).json({ success: false, error: 'Method not allowed' });
        }
        const { apiKey: apiKey10, apiSecret: apiSecret10, sellerId: sellerId10, orderId: orderId2, shipmentData } = body;
        if (!apiKey10 || !apiSecret10 || !sellerId10 || !orderId2 || !shipmentData) {
          return res.status(400).json({ success: false, error: 'API Key, API Secret, Seller ID, orderId ve kargo bilgileri gerekli' });
        }
        const result4 = await makeTrendyolRequest(
          `/suppliers/${sellerId10}/orders/${orderId2}/shipment`,
          { method: 'POST', apiKey: apiKey10, apiSecret: apiSecret10, body: shipmentData }
        );
        return res.json({ success: true, result: result4 });

      case 'trendyol/update-stock':
        if (method !== 'POST') {
          return res.status(405).json({ success: false, error: 'Method not allowed' });
        }
        const { apiKey: apiKeyStock, apiSecret: apiSecretStock, sellerId: sellerIdStock, stocks } = body;
        if (!apiKeyStock || !apiSecretStock || !sellerIdStock || !stocks) {
          return res.status(400).json({ success: false, error: 'API Key, API Secret, Seller ID ve stocks gerekli' });
        }
        const stockResult = await makeTrendyolRequest(
          `/sapigw/suppliers/${sellerIdStock}/products/stock-updates`,
          { method: 'POST', apiKey: apiKeyStock, apiSecret: apiSecretStock, sellerId: sellerIdStock, body: { items: stocks } }
        );
        return res.json({ success: true, batchId: stockResult.batchId });

      case 'trendyol/update-price':
        if (method !== 'POST') {
          return res.status(405).json({ success: false, error: 'Method not allowed' });
        }
        const { apiKey: apiKeyPrice, apiSecret: apiSecretPrice, sellerId: sellerIdPrice, priceInfos } = body;
        if (!apiKeyPrice || !apiSecretPrice || !sellerIdPrice || !priceInfos) {
          return res.status(400).json({ success: false, error: 'API Key, API Secret, Seller ID ve priceInfos gerekli' });
        }
        const priceResult = await makeTrendyolRequest(
          `/sapigw/suppliers/${sellerIdPrice}/products/price-updates`,
          { method: 'POST', apiKey: apiKeyPrice, apiSecret: apiSecretPrice, sellerId: sellerIdPrice, body: { items: priceInfos } }
        );
        return res.json({ success: true, batchId: priceResult.batchId });

      case 'trendyol/create-product':
        if (method !== 'POST') {
          return res.status(405).json({ success: false, error: 'Method not allowed' });
        }
        const { apiKey: apiKeyProduct, apiSecret: apiSecretProduct, sellerId: sellerIdProduct, products: productList } = body;
        if (!apiKeyProduct || !apiSecretProduct || !sellerIdProduct || !productList) {
          return res.status(400).json({ success: false, error: 'API Key, API Secret, Seller ID ve products gerekli' });
        }
        const productResult = await makeTrendyolRequest(
          `/sapigw/suppliers/${sellerIdProduct}/v2/products`,
          { method: 'POST', apiKey: apiKeyProduct, apiSecret: apiSecretProduct, sellerId: sellerIdProduct, body: { products: productList } }
        );
        return res.json({ success: true, batchId: productResult.batchId });

      case 'trendyol/check-batch-status':
        if (method !== 'GET') {
          return res.status(405).json({ success: false, error: 'Method not allowed' });
        }
        const { apiKey: apiKeyBatch, apiSecret: apiSecretBatch, sellerId: sellerIdBatch, batchId } = query;
        if (!apiKeyBatch || !apiSecretBatch || !sellerIdBatch || !batchId) {
          return res.status(400).json({ success: false, error: 'API Key, API Secret, Seller ID ve batchId gerekli' });
        }
        const batchResult = await makeTrendyolRequest(
          `/gpgw/v1/${sellerIdBatch}/check-status`,
          { 
            apiKey: apiKeyBatch, 
            apiSecret: apiSecretBatch, 
            sellerId: sellerIdBatch,
            params: { batchId } 
          }
        );
        return res.json({ success: true, result: batchResult });

      case 'trendyol/get-categories':
        if (method !== 'GET') {
          return res.status(405).json({ success: false, error: 'Method not allowed' });
        }
        const { apiKey: apiKeyCat, apiSecret: apiSecretCat, sellerId: sellerIdCat } = query;
        if (!apiKeyCat || !apiSecretCat || !sellerIdCat) {
          return res.status(400).json({ success: false, error: 'API Key, API Secret ve Seller ID gerekli' });
        }
        const categoriesResult = await makeTrendyolRequest(
          `/gpgw/v1/${sellerIdCat}/lookup/product-categories/by-barcodes`,
          { apiKey: apiKeyCat, apiSecret: apiSecretCat, sellerId: sellerIdCat }
        );
        return res.json({ success: true, categories: categoriesResult });

      case 'trendyol/get-origins':
        if (method !== 'GET') {
          return res.status(405).json({ success: false, error: 'Method not allowed' });
        }
        const { apiKey: apiKeyOrigin, apiSecret: apiSecretOrigin, sellerId: sellerIdOrigin } = query;
        if (!apiKeyOrigin || !apiSecretOrigin || !sellerIdOrigin) {
          return res.status(400).json({ success: false, error: 'API Key, API Secret ve Seller ID gerekli' });
        }
        const originsResult = await makeTrendyolRequest(
          `/gpgw/v1/${sellerIdOrigin}/lookup/origins`,
          { apiKey: apiKeyOrigin, apiSecret: apiSecretOrigin, sellerId: sellerIdOrigin }
        );
        return res.json({ success: true, origins: originsResult });

      case 'health':
        if (method !== 'GET') {
          return res.status(405).json({ success: false, error: 'Method not allowed' });
        }
        return res.json({ status: 'OK', timestamp: new Date().toISOString() });

      default:
        return res.status(404).json({ success: false, error: 'Endpoint not found' });
    }
  } catch (err) {
    console.error('API Error:', err);
    console.error('Stack:', err.stack);
    return res.status(500).json({ 
      success: false, 
      error: err.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
}