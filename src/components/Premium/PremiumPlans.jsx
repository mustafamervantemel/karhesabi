import React, { useState } from 'react';
import { 
  Check, 
  Crown, 
  Zap, 
  BarChart3, 
  FileText, 
  Brain, 
  TrendingUp, 
  Package,
  Star,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

function PremiumPlans() {
  const { currentUser, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleFreePlan = () => {
    toast.success('Ücretsiz plan zaten aktif!');
  };

  const handlePremiumUpgrade = () => {
    setLoading(true);
    // Premium kullanıcıyı entegrasyon sayfasına yönlendir
    setTimeout(() => {
      toast.success('Premium özellikler aktif! Entegrasyon sayfasına yönlendiriliyorsunuz...');
      setLoading(false);
      // Entegrasyon sayfasına yönlendir
      window.location.href = '/entegrasyon';
    }, 2000);
  };

  const features = {
    free: [
      { icon: BarChart3, text: 'Kâr hesaplama aracı', included: true },
      { icon: Package, text: 'Ürün bazlı maliyet analizi', included: true },
      { icon: Brain, text: '3 kez ücretsiz AI asistan kullanımı', included: true },
      { icon: TrendingUp, text: 'AI destekli ürün açıklaması', included: false },
      { icon: Sparkles, text: 'AI kâr artırma önerileri', included: false },
      { icon: FileText, text: 'Özel PDF raporları', included: false },
    ],
    premium: [
      { icon: BarChart3, text: 'Kâr hesaplama aracı', included: true },
      { icon: Package, text: 'Ürün bazlı maliyet analizi', included: true },
      { icon: Brain, text: 'Sınırsız AI asistan kullanımı', included: true },
      { icon: TrendingUp, text: 'AI destekli ürün açıklaması ve başlık üretimi', included: true },
      { icon: Sparkles, text: 'AI ile kâr artırma önerileri', included: true },
      { icon: Zap, text: 'AI satış tahminleri', included: true },
      { icon: Package, text: 'Stok planlama asistanı', included: true },
      { icon: FileText, text: 'Özel PDF raporları', included: true },
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
              <Crown className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Üyelik Planlarımız
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            KârHesap ile daha fazlasını keşfedin
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
          {/* Free Plan */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 relative">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Ücretsiz Plan</h2>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">0₺</span>
                <span className="text-gray-600"> / ay</span>
              </div>
              <p className="text-gray-600">Başlangıç için mükemmel</p>
            </div>

            {/* Features */}
            <div className="space-y-4 mb-8">
              {features.free.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                    feature.included ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {feature.included ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <span className="text-xs">×</span>
                    )}
                  </div>
                  <span className={`text-sm ${feature.included ? 'text-gray-900' : 'text-gray-400'}`}>
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <button
              onClick={handleFreePlan}
              className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Ücretsiz Kullan
            </button>
          </div>

          {/* Premium Plan */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-xl border-2 border-orange-200 p-8 relative overflow-hidden">
            {/* Premium Badge */}
            <div className="absolute top-0 right-0 bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-4 py-2 rounded-bl-xl text-sm font-bold flex items-center space-x-1">
              <Star className="w-4 h-4" />
              <span>POPÜLER</span>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Premium Plan</h2>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">99₺</span>
                <span className="text-gray-600"> / ay</span>
              </div>
              <p className="text-gray-600">Profesyonel işletmeler için</p>
            </div>

            {/* Features */}
            <div className="space-y-4 mb-8">
              {features.premium.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="text-sm text-gray-900">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <button
              onClick={handlePremiumUpgrade}
              disabled={loading || userProfile?.isPremium}
              className={`w-full py-3 px-6 rounded-xl font-medium transition-all transform hover:scale-105 ${
                userProfile?.isPremium
                  ? 'bg-green-500 text-white cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white hover:from-orange-600 hover:to-yellow-600'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>İşleniyor...</span>
                </div>
              ) : userProfile?.isPremium ? (
                <div className="flex items-center justify-center space-x-2">
                  <Check className="w-4 h-4" />
                  <span>Premium Aktif</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span>Premium'a Geç</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center space-y-6">
          {/* Current Status */}
          {currentUser && (
            <div className="bg-white rounded-xl shadow-md p-6 max-w-md mx-auto">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${userProfile?.isPremium ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-sm font-medium text-gray-700">
                  {userProfile?.isPremium ? 'Premium Üye' : 'Ücretsiz Üye'}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {userProfile?.isPremium 
                  ? 'Tüm premium özelliklere erişiminiz var' 
                  : 'Premium özellikleri denemek için yükseltin'
                }
              </p>
            </div>
          )}

          {/* Features Comparison */}
          <div className="bg-white rounded-xl shadow-md p-8 max-w-4xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
              Özellik Karşılaştırması
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Brain className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">AI Asistan</h4>
                <p className="text-sm text-gray-600">
                  Ücretsiz: 3 kullanım<br />
                  Premium: Sınırsız
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Satış Analizi</h4>
                <p className="text-sm text-gray-600">
                  Ücretsiz: Temel<br />
                  Premium: Gelişmiş
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Raporlar</h4>
                <p className="text-sm text-gray-600">
                  Ücretsiz: Yok<br />
                  Premium: PDF Raporları
                </p>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="text-center">
            <p className="text-sm text-gray-500 max-w-2xl mx-auto">
              *Premium üyelik iptal edilebilir, denemesi ücretsizdir. 
              Ödeme bilgileriniz güvenle saklanır ve istediğiniz zaman iptal edebilirsiniz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PremiumPlans; 