// Trendyol API Service - Proxy Server üzerinden
const PROXY_BASE_URL = import.meta.env.VITE_PROXY_BASE_URL || 'http://localhost:4000/api/trendyol';

class TrendyolService {
  constructor() {
    this.apiKey = null;
    this.apiSecret = null;
    this.sellerId = null;
  }

  // API bilgilerini ayarla
  setCredentials(apiKey, apiSecret, sellerId = null) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.sellerId = sellerId;
  }

  // Proxy üzerinden API isteği gönder
  async makeProxyRequest(endpoint, options = {}) {
    try {
      const url = `${PROXY_BASE_URL}${endpoint}`;
      const requestOptions = {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      };

      // Query parametreleri ekle
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

      // Body ekle
      if (options.body) {
        requestOptions.body = JSON.stringify(options.body);
      }

      const response = await fetch(url, requestOptions);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error('Proxy API Error:', error);
      throw error;
    }
  }

  // Bağlantı testi
  async testConnection(apiKey, apiSecret, sellerId) {
    // Parametreler verilmişse geçici olarak kullan
    const testApiKey = apiKey || this.apiKey;
    const testApiSecret = apiSecret || this.apiSecret;
    const testSellerId = sellerId || this.sellerId;
    
    if (!testApiKey || !testApiSecret) {
      throw new Error('API bilgileri eksik');
    }
    
    const response = await this.makeProxyRequest('/test-connection', {
      method: 'POST',
      body: {
        apiKey: testApiKey,
        apiSecret: testApiSecret,
        sellerId: testSellerId
      }
    });
    return response;
  }

  // Seller bilgilerini al
  async getSellerInfo() {
    if (!this.apiKey || !this.apiSecret) {
      throw new Error('API bilgileri ayarlanmamış');
    }

    try {
      const response = await this.makeProxyRequest('/seller-info', {
        params: {
          apiKey: this.apiKey,
          apiSecret: this.apiSecret
        }
      });

      if (response.success) {
        this.sellerId = response.sellerInfo?.id;
        return response.sellerInfo;
      }
      
      throw new Error(response.error || 'Seller bilgisi alınamadı');
    } catch (error) {
      console.error('Get seller info failed:', error);
      throw error;
    }
  }

  // Ürünleri listele
  async getProducts(page = 0, size = 50) {
    if (!this.apiKey || !this.apiSecret || !this.sellerId) {
      throw new Error('API bilgileri eksik');
    }

    try {
      const response = await this.makeProxyRequest('/products', {
        params: {
          apiKey: this.apiKey,
          apiSecret: this.apiSecret,
          sellerId: this.sellerId,
          page,
          size
        }
      });

      return response.success ? response.products : [];
    } catch (error) {
      console.error('Get products failed:', error);
      throw error;
    }
  }

  // Tek ürün bilgisi al
  async getProduct(productId) {
    if (!this.apiKey || !this.apiSecret || !this.sellerId) {
      throw new Error('API bilgileri eksik');
    }

    try {
      // Önce tüm ürünleri al ve filtrele
      const products = await this.getProducts(0, 1000);
      const product = products.find(p => p.id === productId || p.barcode === productId);
      
      if (!product) {
        throw new Error('Ürün bulunamadı');
      }

      return product;
    } catch (error) {
      console.error('Get product failed:', error);
      throw error;
    }
  }

  // Siparişleri listele
  async getOrders(page = 0, size = 50, status = null) {
    if (!this.apiKey || !this.apiSecret || !this.sellerId) {
      throw new Error('API bilgileri eksik');
    }

    try {
      const params = {
        apiKey: this.apiKey,
        apiSecret: this.apiSecret,
        sellerId: this.sellerId,
        page,
        size
      };

      if (status) {
        params.status = status;
      }

      const response = await this.makeProxyRequest('/orders', {
        params
      });

      return response.success ? response.orders : [];
    } catch (error) {
      console.error('Get orders failed:', error);
      throw error;
    }
  }

  // Tek sipariş bilgisi al
  async getOrder(orderId) {
    if (!this.apiKey || !this.apiSecret || !this.sellerId) {
      throw new Error('API bilgileri eksik');
    }

    try {
      // Önce tüm siparişleri al ve filtrele
      const orders = await this.getOrders(0, 1000);
      const order = orders.find(o => o.id === orderId);
      
      if (!order) {
        throw new Error('Sipariş bulunamadı');
      }

      return order;
    } catch (error) {
      console.error('Get order failed:', error);
      throw error;
    }
  }

  // Sipariş durumunu güncelle
  async updateOrderStatus(orderId, status) {
    if (!this.apiKey || !this.apiSecret || !this.sellerId) {
      throw new Error('API bilgileri eksik');
    }

    try {
      const response = await this.makeProxyRequest('/update-order-status', {
        method: 'PUT',
        body: {
          apiKey: this.apiKey,
          apiSecret: this.apiSecret,
          sellerId: this.sellerId,
          orderId,
          status
        }
      });

      return response.success ? response.result : null;
    } catch (error) {
      console.error('Update order status failed:', error);
      throw error;
    }
  }

  // Kategorileri listele
  async getCategories() {
    if (!this.apiKey || !this.apiSecret) {
      throw new Error('API bilgileri eksik');
    }

    try {
      const response = await this.makeProxyRequest('/categories', {
        params: {
          apiKey: this.apiKey,
          apiSecret: this.apiSecret
        }
      });

      return response.success ? response.categories : [];
    } catch (error) {
      console.error('Get categories failed:', error);
      throw error;
    }
  }

  // Stok güncelle
  async updateStock(stockUpdates) {
    if (!this.apiKey || !this.apiSecret || !this.sellerId) {
      throw new Error('API bilgileri eksik');
    }

    try {
      const response = await this.makeProxyRequest('/update-stock', {
        method: 'POST',
        body: {
          apiKey: this.apiKey,
          apiSecret: this.apiSecret,
          sellerId: this.sellerId,
          stockUpdates
        }
      });

      return response.success ? response.result : null;
    } catch (error) {
      console.error('Update stock failed:', error);
      throw error;
    }
  }

  // Fiyat güncelle
  async updatePrice(priceUpdates) {
    if (!this.apiKey || !this.apiSecret || !this.sellerId) {
      throw new Error('API bilgileri eksik');
    }

    try {
      const response = await this.makeProxyRequest('/update-price', {
        method: 'POST',
        body: {
          apiKey: this.apiKey,
          apiSecret: this.apiSecret,
          sellerId: this.sellerId,
          priceUpdates
        }
      });

      return response.success ? response.result : null;
    } catch (error) {
      console.error('Update price failed:', error);
      throw error;
    }
  }

  // Kargo sağlayıcılarını listele
  async getShipmentProviders() {
    if (!this.apiKey || !this.apiSecret || !this.sellerId) {
      throw new Error('API bilgileri eksik');
    }

    try {
      const response = await this.makeProxyRequest('/shipment-providers', {
        params: {
          apiKey: this.apiKey,
          apiSecret: this.apiSecret,
          sellerId: this.sellerId
        }
      });

      return response.success ? response.providers : [];
    } catch (error) {
      console.error('Get shipment providers failed:', error);
      throw error;
    }
  }

  // Kargo oluştur
  async createShipment(orderId, shipmentData) {
    if (!this.apiKey || !this.apiSecret || !this.sellerId) {
      throw new Error('API bilgileri eksik');
    }

    try {
      const response = await this.makeProxyRequest('/create-shipment', {
        method: 'POST',
        body: {
          apiKey: this.apiKey,
          apiSecret: this.apiSecret,
          sellerId: this.sellerId,
          orderId,
          shipmentData
        }
      });

      return response.success ? response.result : null;
    } catch (error) {
      console.error('Create shipment failed:', error);
      throw error;
    }
  }

  // Toplu stok güncelleme
  async bulkUpdateStock(products) {
    const stockUpdates = products.map(product => ({
      barcode: product.barcode,
      quantity: product.quantity,
      salePrice: product.salePrice,
      listPrice: product.listPrice
    }));

    return this.updateStock(stockUpdates);
  }

  // Toplu fiyat güncelleme
  async bulkUpdatePrice(products) {
    const priceUpdates = products.map(product => ({
      barcode: product.barcode,
      salePrice: product.salePrice,
      listPrice: product.listPrice
    }));

    return this.updatePrice(priceUpdates);
  }

  // Kâr hesaplama
  calculateProfit(salePrice, costPrice, commission = 0.15) {
    const commissionAmount = salePrice * commission;
    const netPrice = salePrice - commissionAmount;
    const profit = netPrice - costPrice;
    const profitMargin = (profit / costPrice) * 100;
    
    return {
      salePrice,
      costPrice,
      commissionAmount,
      netPrice,
      profit,
      profitMargin
    };
  }

  // Ürün performans analizi
  async analyzeProductPerformance(productId, days = 30) {
    try {
      const orders = await this.getOrders(0, 1000);
      const productOrders = orders.filter(order => 
        order.items.some(item => item.productId === productId)
      );

      const totalSales = productOrders.reduce((sum, order) => {
        const item = order.items.find(item => item.productId === productId);
        return sum + (item ? item.quantity : 0);
      }, 0);

      const totalRevenue = productOrders.reduce((sum, order) => {
        const item = order.items.find(item => item.productId === productId);
        return sum + (item ? item.totalPrice : 0);
      }, 0);

      return {
        productId,
        totalSales,
        totalRevenue,
        averageOrderValue: totalSales > 0 ? totalRevenue / totalSales : 0,
        orderCount: productOrders.length
      };
    } catch (error) {
      console.error('Product performance analysis failed:', error);
      throw error;
    }
  }
}

// Singleton instance
const trendyolService = new TrendyolService();
export default trendyolService; 