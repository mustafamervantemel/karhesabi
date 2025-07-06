# 🚀 Deployment Guide - KarHesap Trendyol Entegrasyonu

## Sorun Giderme Özeti

Bu projede tespit edilen ve düzeltilen sorunlar:

### ❌ Önceki Sorunlar:
1. **Proxy Server URL'si hardcode edilmişti** (localhost:4000)
2. **Stage API URL'si production'da da kullanılıyordu**
3. **Environment variables eksikti**
4. **Test connection metodu yanlış parametrelerle çağrılıyordu**

### ✅ Çözümler:
1. **Environment variables sistemi eklendi**
2. **Production/Development ortam ayrımı yapıldı**
3. **Proxy URL'si dinamik hale getirildi**
4. **API endpoint'leri düzeltildi**

## Ortam Kurulumu

### 1. Development (Geliştirme) Ortamı

```bash
# Proje bağımlılıklarını yükle
npm install

# Server bağımlılıklarını yükle
npm run server:install

# Development sunucularını başlat
npm run dev          # Frontend (port 3000)
npm run server:dev   # Backend Proxy (port 4000)
```

### 2. Production (Canlı) Ortamı

#### Adım 1: Environment Variables Ayarla

`.env.production` dosyasını düzenle:

```env
# Production Environment Variables
VITE_API_BASE_URL=https://your-domain.com
VITE_PROXY_BASE_URL=https://your-domain.com/api/trendyol

# Trendyol Production API Configuration
VITE_TRENDYOL_INTEGRATION_CODE=your-production-integration-code
VITE_TRENDYOL_API_KEY=your-production-api-key
VITE_TRENDYOL_API_SECRET=your-production-api-secret
VITE_TRENDYOL_TOKEN=your-production-token

NODE_ENV=production
PORT=4000
```

#### Adım 2: Build ve Deploy

```bash
# Full build (frontend + backend dependencies)
npm run build:full

# Production server'ı başlat
NODE_ENV=production npm run server:start
```

## Trendyol API Konfigürasyonu

### Development Ortamı
- **API Base URL**: `https://stageapigw.trendyol.com`
- **Test verileri**: `src/config/trendyol.js` içinde mevcut

### Production Ortamı
- **API Base URL**: `https://api.trendyol.com/sapigw`
- **Gerçek API bilgileri**: Environment variables'dan alınır

## Önemli Dosyalar

### Frontend
- `src/services/trendyolService.js` - API servis katmanı
- `src/config/trendyol.js` - API konfigürasyonu
- `src/components/Integration/TrendyolIntegration.jsx` - Entegrasyon UI

### Backend
- `server/trendyol-proxy.js` - Proxy server
- `server/package.json` - Backend bağımlılıkları

### Configuration
- `.env` - Development environment variables
- `.env.production` - Production environment variables
- `vite.config.ts` - Frontend build konfigürasyonu

## Test Etme

### 1. Development Testı
```bash
# Sunucuları başlat
npm run dev
npm run server:dev

# Browser'da test et: http://localhost:3000
```

### 2. Production Testı
```bash
# Production build
npm run build:full

# Production server başlat
NODE_ENV=production npm run server:start

# Static files serve edilir: http://localhost:4000
```

## Deployment Seçenekleri

### 1. Vercel/Netlify (Frontend)
- Frontend'i static hosting'e deploy et
- Backend'i ayrı bir servise (Railway, Render, etc.) deploy et

### 2. VPS/Dedicated Server
- Tüm uygulamayı tek sunucuda çalıştır
- PM2 ile process management

### 3. Docker (Önerilen)
```dockerfile
# Dockerfile örneği
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

WORKDIR /app/server
RUN npm install

EXPOSE 4000
CMD ["npm", "start"]
```

## Güvenlik Notları

⚠️ **Önemli**: API anahtarlarınızı asla git repository'sine commit etmeyin!

- ✅ Environment variables kullanın
- ✅ `.env` dosyalarını `.gitignore`'a ekleyin
- ✅ Production'da güvenli environment variable yönetimi yapın

## Troubleshooting

### 1. "Connection refused" hatası
- Proxy server'ın çalıştığından emin olun
- Port 4000'in açık olduğunu kontrol edin

### 2. "API Key invalid" hatası
- Trendyol Partner Portal'dan API bilgilerini kontrol edin
- Environment variables'ların doğru set edildiğini kontrol edin

### 3. CORS hatası
- Proxy server'ın CORS ayarlarını kontrol edin
- Frontend ve backend URL'lerinin uyumunu kontrol edin

## Destek

Sorun yaşarsanız:
1. Bu dosyayı kontrol edin
2. Console log'larını inceleyin
3. Network tab'inde API isteklerini kontrol edin