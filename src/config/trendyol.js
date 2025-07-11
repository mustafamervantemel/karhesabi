// Trendyol API Configuration
// Bu dosya sadece geliştirme aşamasında kullanılacak
// Production'da bu bilgiler environment variables olarak saklanmalı

export const TRENDYOL_CONFIG = {
  // Test ortamı için Trendyol UP yetkilendirmesi (IP: 167.71.42.27)
  TEST: {
    integrationCode: null, // Kullanıcıdan alınacak
    apiKey: null, // Kullanıcıdan alınacak
    apiSecret: null, // Kullanıcıdan alınacak
    token: null, // API Key:Secret'tan oluşturulacak
    baseUrl: 'https://stageapigw.trendyol.com',
    sellerId: null, // API'den alınacak
    allowedIp: '167.71.42.27'
  },
  
  // Geliştirme için test mağazası bilgileri (gerçek API bilgileri kullanılacak)
  DEVELOPMENT: {
    integrationCode: null, // Kullanıcıdan alınacak
    apiKey: null, // Kullanıcıdan alınacak
    apiSecret: null, // Kullanıcıdan alınacak
    token: null, // API Key:Secret'tan oluşturulacak
    baseUrl: 'https://stageapigw.trendyol.com',
    sellerId: null // API'den alınacak
  },
  
  // Production için environment variables
  PRODUCTION: {
    integrationCode: import.meta.env.VITE_TRENDYOL_INTEGRATION_CODE,
    apiKey: import.meta.env.VITE_TRENDYOL_API_KEY,
    apiSecret: import.meta.env.VITE_TRENDYOL_API_SECRET,
    token: import.meta.env.VITE_TRENDYOL_TOKEN,
    baseUrl: 'https://api.trendyol.com',
    sellerId: null
  }
};

// Aktif konfigürasyonu seç
export const getTrendyolConfig = () => {
  const mode = import.meta.env.VITE_TRENDYOL_ENV || import.meta.env.MODE;
  
  if (mode === 'test') {
    return TRENDYOL_CONFIG.TEST;
  } else if (mode === 'production') {
    return TRENDYOL_CONFIG.PRODUCTION;
  } else {
    return TRENDYOL_CONFIG.DEVELOPMENT;
  }
};

// API endpoint'leri
export const TRENDYOL_ENDPOINTS = {
  // Seller bilgileri
  GET_SELLER_INFO: '/suppliers',
  
  // Ürün işlemleri
  GET_PRODUCTS: '/suppliers/{supplierId}/products',
  GET_PRODUCT: '/suppliers/{supplierId}/products/{productId}',
  UPDATE_PRODUCT: '/suppliers/{supplierId}/products/{productId}',
  
  // Sipariş işlemleri
  GET_ORDERS: '/suppliers/{supplierId}/orders',
  GET_ORDER: '/suppliers/{supplierId}/orders/{orderId}',
  UPDATE_ORDER_STATUS: '/suppliers/{supplierId}/orders/{orderId}/status',
  
  // Kategori işlemleri
  GET_CATEGORIES: '/product-categories',
  GET_CATEGORY_ATTRIBUTES: '/product-categories/{categoryId}/attributes',
  
  // Stok işlemleri
  UPDATE_STOCK: '/suppliers/{supplierId}/products/stock-updates',
  
  // Fiyat işlemleri
  UPDATE_PRICE: '/suppliers/{supplierId}/products/price-updates',
  
  // Kargo işlemleri
  GET_SHIPMENT_PROVIDERS: '/suppliers/{supplierId}/shipment-providers',
  CREATE_SHIPMENT: '/suppliers/{supplierId}/orders/{orderId}/shipment'
};

// API helper fonksiyonları
export const createTrendyolHeaders = (config) => {
  return {
    'Authorization': `Basic ${config.token}`,
    'Content-Type': 'application/json',
    'User-Agent': 'KarHesap-Trendyol-Integration/1.0'
  };
};

export const buildApiUrl = (endpoint, config, params = {}) => {
  let url = `${config.baseUrl}${endpoint}`;
  
  // URL parametrelerini değiştir
  Object.keys(params).forEach(key => {
    url = url.replace(`{${key}}`, params[key]);
  });
  
  return url;
}; 