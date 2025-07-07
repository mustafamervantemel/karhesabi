# Trendyol Test Ortamı Kurulumu

## Test Ortamı Bilgileri
- **IP Adresi:** 167.71.42.27
- **Test Modu:** Trendyol UP yetkilendirmesi alındı
- **Stage API URL:** https://stageapigw.trendyol.com

## Kurulum Adımları

### 1. Test Ortamı Konfigürasyonu
```bash
# Test ortamı için environment değişkenlerini ayarla
cp .env.test .env.local
```

### 2. Server Başlatma
```bash
# 1. Environment dosyasını kopyala
cp .env.test .env

# 2. Backend sunucusunu başlat (test modu)
cd server
TRENDYOL_ENV=test node trendyol-proxy.js

# 3. Frontend'i başlat (test modu) - yeni terminal
cd ..
VITE_TRENDYOL_ENV=test npm run dev -- --host 167.71.42.27 --port 5173

# VEYA tek komutla:
npm run dev:test
```

### CORS Hata Giderme
Eğer "Access control checks" hatası alıyorsanız:

1. **Backend'i doğru IP'de çalıştırın:**
```bash
cd server
TRENDYOL_ENV=test node trendyol-proxy.js
```

2. **Frontend'i doğru IP'de çalıştırın:**
```bash
VITE_TRENDYOL_ENV=test npm run dev -- --host 167.71.42.27 --port 5173
```

3. **Browser'da şu URL'yi kullanın:**
```
http://167.71.42.27:5173
```

4. **Console'da hataları kontrol edin:**
- F12 > Console > Network tabında hataları görün
- Backend console'da "CORS blocked origin" mesajlarını kontrol edin

### 3. Test Modu Erişimi
- **Frontend:** http://167.71.42.27:5173
- **Backend API:** http://167.71.42.27:4000
- **Trendyol API:** https://stageapigw.trendyol.com

## Konfigürasyon Değişiklikleri

### 1. CORS Ayarları
- IP adresi 167.71.42.27 CORS listesine eklendi
- Hem development hem production modlarında desteklenir

### 2. API Base URL
- Test modu: `https://stageapigw.trendyol.com`
- Production modu: `https://api.trendyol.com/sapigw`

### 3. Proxy Server
- Test ortamı için özel proxy URL: `http://167.71.42.27:4000/api/trendyol`

## Test Edilecek Özellikler

1. **Bağlantı Testi**
   - API Key ve Secret ile bağlantı
   - Seller bilgileri alma

2. **Ürün İşlemleri**
   - Ürün listesi alma
   - Tek ürün bilgisi alma
   - Stok güncelleme
   - Fiyat güncelleme

3. **Sipariş İşlemleri**
   - Sipariş listesi alma
   - Sipariş durumu güncelleme
   - Kargo işlemleri

4. **Kategori İşlemleri**
   - Kategori listesi alma
   - Kategori özniteliklerini alma

## Güvenlik Notları

- API Key ve Secret bilgileri güvenli şekilde saklanmalı
- Test ortamında gerçek müşteri verilerini kullanmayın
- IP whitelist kuralları nedeniyle sadece 167.71.42.27 IP'sinden erişim mümkün

## Hata Giderme

### Bağlantı Sorunları
- IP adresinin doğru olduğundan emin olun
- Firewall ayarlarını kontrol edin
- CORS ayarlarını kontrol edin

### API Hataları
- API Key ve Secret'ın doğru olduğundan emin olun
- Stage API URL'inin doğru olduğundan emin olun
- Network bağlantısını kontrol edin

### Environment Sorunları
- .env.test dosyasının doğru yüklendiğinden emin olun
- VITE_TRENDYOL_ENV=test ayarlandığından emin olun
- Server'da TRENDYOL_ENV=test ayarlandığından emin olun