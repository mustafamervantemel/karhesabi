import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  DollarSign,
  Calendar,
  ArrowUp,
  ArrowDown,
  Eye,
  Download,
  RefreshCw,
  Settings,
  Bell,
  Search,
  Filter,
  MoreVertical
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import trendyolService from '../../services/trendyolService';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function SellerPanel() {
  const { currentUser, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeCustomers: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser || !userProfile?.trendyolConnected) {
      return;
    }

    loadDashboardData();
  }, [currentUser, userProfile]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Paralel olarak verileri yükle
      const [orders, products] = await Promise.all([
        trendyolService.getOrders(0, 10),
        trendyolService.getProducts(0, 10)
      ]);

      // İstatistikleri hesapla
      const totalRevenue = orders.content?.reduce((sum, order) => 
        sum + (order.totalPrice || 0), 0) || 0;

      setStats({
        totalProducts: products.totalElements || 0,
        totalOrders: orders.totalElements || 0,
        totalRevenue: totalRevenue,
        activeCustomers: orders.content?.length || 0
      });

      setRecentOrders(orders.content || []);
      setTopProducts(products.content || []);

    } catch (error) {
      console.error('Dashboard verisi yüklenirken hata:', error);
      toast.error('Veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'created': return 'bg-blue-100 text-blue-800';
      case 'packaged': return 'bg-yellow-100 text-yellow-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'created': return 'Oluşturuldu';
      case 'packaged': return 'Paketlendi';
      case 'shipped': return 'Kargoda';
      case 'delivered': return 'Teslim Edildi';
      case 'cancelled': return 'İptal Edildi';
      default: return status || 'Bilinmiyor';
    }
  };

  if (!currentUser || !userProfile?.trendyolConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Entegrasyon Gerekli
          </h1>
          <p className="text-gray-600 mb-6">
            Panel'e erişmek için önce Trendyol entegrasyonunu tamamlamalısınız.
          </p>
          <button
            onClick={() => navigate('/entegrasyon')}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Entegrasyonu Tamamla
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Satıcı Paneli</h1>
            <p className="text-gray-600">
              Hoş geldiniz, {userProfile.trendyolSellerName || 'Satıcı'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={loadDashboardData}
              disabled={loading}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Ürün</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+12%</span>
              <span className="text-gray-500 ml-1">geçen aya göre</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Sipariş</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+8%</span>
              <span className="text-gray-500 ml-1">geçen aya göre</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Gelir</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+15%</span>
              <span className="text-gray-500 ml-1">geçen aya göre</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktif Müşteri</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeCustomers}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <ArrowDown className="w-4 h-4 text-red-500 mr-1" />
              <span className="text-red-600">-3%</span>
              <span className="text-gray-500 ml-1">geçen aya göre</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Son Siparişler</h2>
                <button className="text-orange-600 hover:text-orange-700 text-sm font-medium">
                  Tümünü Gör
                </button>
              </div>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentOrders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <ShoppingCart className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">#{order.id}</p>
                          <p className="text-sm text-gray-600">{formatDate(order.orderDate)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{formatCurrency(order.totalPrice)}</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Henüz sipariş bulunmuyor
                </div>
              )}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">En Çok Satan Ürünler</h2>
                <button className="text-orange-600 hover:text-orange-700 text-sm font-medium">
                  Tümünü Gör
                </button>
              </div>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : topProducts.length > 0 ? (
                <div className="space-y-4">
                  {topProducts.slice(0, 5).map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{product.title?.substring(0, 30)}...</p>
                          <p className="text-sm text-gray-600">Stok: {product.stockCode}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{formatCurrency(product.salePrice)}</p>
                        <p className="text-sm text-gray-600">Satış: {product.salesCount || 0}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Henüz ürün bulunmuyor
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Hızlı İşlemler</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="flex items-center space-x-3 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
              <Package className="w-5 h-5 text-orange-600" />
              <span className="font-medium text-gray-900">Ürün Ekle</span>
            </button>
            <button className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-900">Siparişleri Gör</span>
            </button>
            <button className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <BarChart3 className="w-5 h-5 text-green-600" />
              <span className="font-medium text-gray-900">Rapor Al</span>
            </button>
            <button className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <Settings className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-gray-900">Ayarlar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SellerPanel; 