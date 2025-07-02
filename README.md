# KârHesap - Trendyol Entegrasyonu

KârHesap, Trendyol satıcıları için geliştirilmiş kapsamlı bir e-ticaret yönetim platformudur. Bu proje, Trendyol API entegrasyonu ile ürün yönetimi, sipariş takibi, stok güncelleme ve kâr hesaplama özelliklerini sunar.

## 🚀 Özellikler

- **Trendyol API Entegrasyonu**: TLS 1.2+ desteği ile güvenli API bağlantısı
- **Ürün Yönetimi**: Ürün listesi, stok ve fiyat güncelleme
- **Sipariş Takibi**: Gerçek zamanlı sipariş durumu takibi
- **Kâr Hesaplama**: Detaylı kâr analizi ve komisyon hesaplamaları
- **Performans Analizi**: Ürün ve satış performans raporları
- **Güvenli Kimlik Doğrulama**: Firebase Authentication entegrasyonu
- **Modern UI/UX**: React + TailwindCSS ile responsive tasarım

## 📋 Gereksinimler

- Node.js 16.0.0 veya üzeri
- npm veya yarn
- Trendyol Partner hesabı ve API bilgileri

## 🛠️ Kurulum

### 1. Projeyi Klonlayın

```bash
git clone <repository-url>
cd project
```

### 2. Frontend Bağımlılıklarını Yükleyin

```bash
npm install
```

### 3. Backend Bağımlılıklarını Yükleyin

```bash
cd server
npm install
```

### 4. Environment Variables

`.env` dosyası oluşturun:

```env
# Firebase Config
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

# Trendyol API (Production)
VITE_TRENDYOL_API_KEY=your_trendyol_api_key
VITE_TRENDYOL_API_SECRET=your_trendyol_api_secret
VITE_TRENDYOL_INTEGRATION_CODE=your_integration_code
```

### 5. Uygulamayı Başlatın

#### Backend Server (Terminal 1)
```bash
cd server
npm start
```

#### Frontend Development Server (Terminal 2)
```bash
npm run dev
```

## 🔧 API Endpoints

### Proxy Server Endpoints

- `POST /api/trendyol/test-connection` - Bağlantı testi
- `GET /api/trendyol/seller-info` - Satıcı bilgileri
- `GET /api/trendyol/products` - Ürün listesi
- `GET /api/trendyol/orders` - Sipariş listesi
- `POST /api/trendyol/update-stock` - Stok güncelleme
- `POST /api/trendyol/update-price` - Fiyat güncelleme
- `GET /api/trendyol/categories` - Kategori listesi
- `PUT /api/trendyol/update-order-status` - Sipariş durumu güncelleme
- `POST /api/trendyol/create-shipment` - Kargo oluşturma

## 📁 Proje Yapısı

```
project/
├── src/
│   ├── components/
│   │   ├── Auth/           # Kimlik doğrulama bileşenleri
│   │   ├── Calculator/     # Kâr hesaplama
│   │   ├── Integration/    # Trendyol entegrasyonu
│   │   ├── Layout/         # Sayfa düzeni
│   │   ├── Panel/          # Satıcı paneli
│   │   └── Premium/        # Premium planlar
│   ├── config/             # Konfigürasyon dosyaları
│   ├── contexts/           # React context'leri
│   ├── services/           # API servisleri
│   └── main.tsx           # Ana uygulama
├── server/
│   ├── trendyol-proxy.js  # Proxy server
│   └── package.json       # Server bağımlılıkları
└── package.json           # Frontend bağımlılıkları
```

## 🔐 Güvenlik

- TLS 1.2+ zorunlu kullanımı
- API bilgileri şifrelenmiş saklama
- CORS koruması
- Input validation ve sanitization

## 🚀 Kullanım

### 1. Hesap Oluşturma
- KârHesap'ta hesap oluşturun
- Premium plana geçin

### 2. Trendyol Entegrasyonu
- Trendyol Partner Portal'dan API bilgilerinizi alın
- Entegrasyon sayfasında API bilgilerinizi girin
- Bağlantıyı test edin ve entegrasyonu tamamlayın

### 3. Ürün Yönetimi
- Ürünlerinizi görüntüleyin
- Stok ve fiyat güncellemeleri yapın
- Toplu güncelleme işlemleri gerçekleştirin

### 4. Sipariş Takibi
- Gelen siparişleri takip edin
- Sipariş durumlarını güncelleyin
- Kargo bilgilerini yönetin

### 5. Analiz ve Raporlama
- Kâr hesaplamaları yapın
- Ürün performansını analiz edin
- Satış raporları alın

## 🔧 Geliştirme

### Yeni Özellik Ekleme

1. Feature branch oluşturun
2. Gerekli bileşenleri ve servisleri ekleyin
3. Test edin
4. Pull request oluşturun

### API Geliştirme

1. `server/trendyol-proxy.js` dosyasına yeni endpoint ekleyin
2. Frontend servisini güncelleyin
3. UI bileşenlerini oluşturun

## 📊 Performans

- Proxy server ile API rate limiting
- Caching mekanizmaları
- Optimized database queries
- Lazy loading ve code splitting

## 🐛 Sorun Giderme

### Bağlantı Sorunları
1. API bilgilerinizi kontrol edin
2. TLS 1.2+ desteğini doğrulayın
3. Proxy server'ın çalıştığından emin olun

### Performans Sorunları
1. Network bağlantınızı kontrol edin
2. API rate limit'lerini kontrol edin
3. Cache ayarlarını gözden geçirin

## 📞 Destek

- **Email**: support@karhesap.com
- **Dokümantasyon**: [docs.karhesap.com](https://docs.karhesap.com)
- **API Referansı**: [api.karhesap.com](https://api.karhesap.com)

## 📄 Lisans

Bu proje ISC lisansı altında lisanslanmıştır.

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add some amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📈 Roadmap

- [ ] Webhook entegrasyonu
- [ ] Çoklu mağaza desteği
- [ ] Mobil uygulama
- [ ] Gelişmiş analitik
- [ ] Otomatik fiyatlandırma
- [ ] Stok uyarıları

---

**KârHesap** - Trendyol satıcıları için akıllı e-ticaret yönetimi 