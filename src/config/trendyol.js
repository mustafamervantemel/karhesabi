// Trendyol API Configuration
// Bu dosya sadece geliştirme aşamasında kullanılacak
// Production'da bu bilgiler environment variables olarak saklanmalı

export const TRENDYOL_CONFIG = {
  // Geliştirme için test mağazası bilgileri
  DEVELOPMENT: {
    integrationCode: 'e6d3d8a0-f282-492a-ab8b-d74df5e1b9d8',
    apiKey: 'GAouyKM683D8MFr5FpfT',
    apiSecret: 'J5wbnuUDH8ABEVvchUpQ',
    token: 'R0FvdXlLTTY4M0Q4TUZyNUZwZlQ6SjV3Ym51VURIOEFCRVZ2Y2hVcFE=',
    baseUrl: 'https://api.trendyol.com/sapigw',
    sellerId: null // API'den alınacak
  },
  
  // Production için environment variables
  PRODUCTION: {
    integrationCode: import.meta.env.VITE_TRENDYOL_INTEGRATION_CODE,
    apiKey: import.meta.env.VITE_TRENDYOL_API_KEY,
    apiSecret: import.meta.env.VITE_TRENDYOL_API_SECRET,
    token: import.meta.env.VITE_TRENDYOL_TOKEN,
    baseUrl: 'https://api.trendyol.com/sapigw',
    sellerId: null
  }
};

// Aktif konfigürasyonu seç
export const getTrendyolConfig = () => {
  return import.meta.env.MODE === 'production' 
    ? TRENDYOL_CONFIG.PRODUCTION 
    : TRENDYOL_CONFIG.DEVELOPMENT;
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