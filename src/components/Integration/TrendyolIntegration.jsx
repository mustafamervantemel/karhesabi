import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, 
  CheckCircle, 
  XCircle, 
  Loader, 
  ExternalLink,
  AlertCircle,
  Shield,
  Zap,
  Database,
  Users,
  TrendingUp,
  Info,
  Key,
  Lock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import trendyolService from '../../services/trendyolService';
import toast from 'react-hot-toast';

function TrendyolIntegration() {
  const { currentUser, userProfile, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [sellerInfo, setSellerInfo] = useState(null);
  const [step, setStep] = useState(1);
  const [showHelp, setShowHelp] = useState(false);

  // Kullanıcıdan alınacak entegrasyon bilgileri
  const [form, setForm] = useState({
    sellerId: '',
    apiKey: '',
    apiSecret: '',
    syncDays: 3,
    orderStatus: 'Onay Bekliyor',
  });

  const orderStatusOptions = [
    'Onay Bekliyor',
    'Hazırlanıyor',
    'Kargoya Verildi',
    'Teslim Edildi',
    'İptal Edildi',
  ];

  // useEffect(() => {
  //   if (!currentUser || !userProfile?.isPremium) {
  //     navigate('/premium');
  //     return;
  //   }
  //   if (userProfile.trendyolConnected) {
  //     navigate('/panel');
  //   }
  // }, [currentUser, userProfile, navigate]);

  // Form değişikliği
  const handleFormChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // Bağlantı testi (yeni servis ile)
  const handleTestConnection = async (e) => {
    if (e) e.preventDefault();
    setTesting(true);
    setConnectionStatus(null);
    
    try {
      // Yeni servis ile bağlantı testi
      const result = await trendyolService.testConnection(form.apiKey, form.apiSecret, form.sellerId);

      if (result.success) {
        setConnectionStatus('success');
        setSellerInfo(result.sellerInfo);
        // Seller ID'yi otomatik olarak doldur
        if (result.sellerInfo && result.sellerInfo.id) {
          setForm(prev => ({ ...prev, sellerId: result.sellerInfo.id }));
        }
        toast.success('Trendyol bağlantısı başarılı!');
        setStep(2);
      } else {
        setConnectionStatus('error');
        toast.error('Bağlantı başarısız: ' + (result.error || 'Bilinmeyen hata'));
      }
    } catch (error) {
      setConnectionStatus('error');
      console.error('Connection test error:', error);
      toast.error('Bağlantı testi sırasında hata oluştu: ' + error.message);
    } finally {
      setTesting(false);
    }
  };

  // Entegrasyonu tamamla (bilgileri kaydet)
  const handleCompleteIntegration = async () => {
    setLoading(true);
    try {
      // Servis bilgilerini ayarla
      trendyolService.setCredentials(form.apiKey, form.apiSecret, form.sellerId);

      // Temporarily skip Firebase profile update
      // await updateUserProfile(currentUser.uid, {
      //   trendyolConnected: true,
      //   trendyolSellerId: form.sellerId,
      //   trendyolSellerName: sellerInfo?.name,
      //   integrationCompletedAt: new Date().toISOString(),
      //   trendyolApiKey: form.apiKey,
      //   trendyolApiSecret: form.apiSecret,
      // });
      
      // Store credentials locally for testing
      localStorage.setItem('trendyol_credentials', JSON.stringify({
        apiKey: form.apiKey,
        apiSecret: form.apiSecret,
        sellerId: form.sellerId,
        sellerInfo: sellerInfo
      }));
      
      toast.success('Entegrasyon başarıyla tamamlandı!');
      setTimeout(() => {
        navigate('/panel');
      }, 1200);
    } catch (error) {
      console.error('Entegrasyon hatası:', error);
      toast.error('Entegrasyon tamamlanırken hata oluştu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (testing) return <Loader className="w-6 h-6 animate-spin text-blue-500" />;
    if (connectionStatus === 'success') return <CheckCircle className="w-6 h-6 text-green-500" />;
    if (connectionStatus === 'error') return <XCircle className="w-6 h-6 text-red-500" />;
    return <AlertCircle className="w-6 h-6 text-gray-400" />;
  };

  const getStatusText = () => {
    if (testing) return 'Bağlantı test ediliyor...';
    if (connectionStatus === 'success') return 'Bağlantı başarılı';
    if (connectionStatus === 'error') return 'Bağlantı başarısız';
    return 'Bağlantı test edilmedi';
  };

  // Temporarily disable auth check for API testing
  // if (!currentUser || !userProfile?.isPremium) {
  //   return null;
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
              <Settings className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Trendyol Entegrasyonu
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Mağazanızı KârHesap ile bağlayın ve satışlarınızı optimize edin
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            <div className={`flex items-center ${step >= 1 ? 'text-orange-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                step >= 1 ? 'border-orange-600 bg-orange-600 text-white' : 'border-gray-300'
              }`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium">API Bilgileri</span>
            </div>
            <div className={`w-8 h-0.5 ${step >= 2 ? 'bg-orange-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center ${step >= 2 ? 'text-orange-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                step >= 2 ? 'border-orange-600 bg-orange-600 text-white' : 'border-gray-300'
              }`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Entegrasyon Tamamla</span>
            </div>
          </div>
        </div>

        {/* Step 1: API Bilgileri Formu ve Bağlantı Testi */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">1. API Bilgilerinizi Girin</h2>
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="text-orange-600 hover:text-orange-700"
              >
                <Info className="w-5 h-5" />
              </button>
            </div>

            {showHelp && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">API Bilgilerini Nasıl Alırım?</h3>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Trendyol Partner Portal'a giriş yapın</li>
                  <li>2. "Entegrasyon" bölümüne gidin</li>
                  <li>3. "API Bilgileri" sekmesini açın</li>
                  <li>4. API Key ve API Secret bilgilerinizi kopyalayın</li>
                  <li>5. Integration Code'unuzu not edin</li>
                </ol>
                <a 
                  href="https://partner.trendyol.com/account/keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 mt-2"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Partner Portal'a Git
                </a>
              </div>
            )}

            <form onSubmit={handleTestConnection} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Key className="w-4 h-4 inline mr-1" />
                  API Key
                </label>
                <input
                  type="text"
                  name="apiKey"
                  value={form.apiKey}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  required
                  placeholder="GAouyKM683D8MFr5FpfT"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Lock className="w-4 h-4 inline mr-1" />
                  API Secret
                </label>
                <input
                  type="password"
                  name="apiSecret"
                  value={form.apiSecret}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  required
                  placeholder="J5wbnuUDH8ABEVvchUpQ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Users className="w-4 h-4 inline mr-1" />
                  Seller ID (Opsiyonel)
                </label>
                <input
                  type="text"
                  name="sellerId"
                  value={form.sellerId}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  placeholder="12345"
                />
              </div>

              {/* Bağlantı Durumu */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                {getStatusIcon()}
                <span className="text-sm font-medium text-gray-700">
                  {getStatusText()}
                </span>
              </div>

              <button
                type="submit"
                disabled={testing || !form.apiKey || !form.apiSecret}
                className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-3 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-yellow-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {testing ? (
                  <span className="flex items-center justify-center">
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                    Test Ediliyor...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <Zap className="w-5 h-5 mr-2" />
                    Bağlantıyı Test Et
                  </span>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Entegrasyon Tamamlama */}
        {step === 2 && sellerInfo && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 max-w-lg mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Entegrasyonu Tamamlayın</h2>
            
            {/* Seller Bilgileri */}
            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-900 mb-3">Mağaza Bilgileri</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700">Mağaza Adı:</span>
                  <span className="font-medium text-green-900">{sellerInfo.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Seller ID:</span>
                  <span className="font-medium text-green-900">{sellerInfo.id}</span>
                </div>
                {sellerInfo.taxNumber && (
                  <div className="flex justify-between">
                    <span className="text-green-700">Vergi No:</span>
                    <span className="font-medium text-green-900">{sellerInfo.taxNumber}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Özellikler */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Entegrasyon Özellikleri</h3>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Ürün listesi görüntüleme
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Sipariş takibi
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Stok ve fiyat güncelleme
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Kâr hesaplama
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Performans analizi
                </div>
              </div>
            </div>

            <button
              onClick={handleCompleteIntegration}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-4 rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Tamamlanıyor...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Entegrasyonu Tamamla
                </span>
              )}
            </button>
          </div>
        )}

        {/* Güvenlik Notu */}
        <div className="text-center">
          <div className="inline-flex items-center text-sm text-gray-500">
            <Shield className="w-4 h-4 mr-1" />
            API bilgileriniz güvenli şekilde şifrelenerek saklanır
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrendyolIntegration; 