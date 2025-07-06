# Canlıya Alma Talimatları

## 1. Railway'e Proxy Server Deploy Etme

### Adım 1: Railway hesabı oluşturun
1. https://railway.app adresine gidin
2. GitHub ile giriş yapın
3. Yeni proje oluşturun

### Adım 2: Server kodunu deploy edin
1. Railway dashboard'da "Deploy from GitHub repo" seçin
2. Bu repository'yi seçin
3. Root directory'yi `/server` olarak ayarlayın
4. Deploy edin

### Adım 3: Environment variables ayarlayın
Railway dashboard'da şu environment variables'ları ekleyin:
```
NODE_ENV=production
PORT=4000
CORS_ORIGIN=https://karhesabi.vercel.app,https://www.karhesabi.vercel.app
```

### Adım 4: Domain URL'ini alın
- Railway size bir URL verecek (örn: `https://karhesabi-proxy.up.railway.app`)
- Bu URL'yi not edin

## 2. Vercel'de Environment Variables Güncelleme

Vercel dashboard'da şu environment variables'ları ekleyin:
```
VITE_PROXY_BASE_URL_PRODUCTION=https://RAILWAY_URL_BURAYA/api/trendyol
```

## 3. Kodu Vercel'e Deploy Etme

```bash
# Değişiklikleri commit edin
git add .
git commit -m "Add production proxy server configuration"
git push origin main
```

## 4. Test Etme

1. https://karhesabi.vercel.app/entegrasyon adresine gidin
2. Trendyol API bilgilerinizi girin
3. "Bağlantıyı Test Et" butonuna tıklayın
4. Bağlantı başarılı olmalı

## Alternatif: Render.com

Railway yerine Render.com da kullanabilirsiniz:
1. https://render.com'da hesap oluşturun
2. "New Web Service" seçin
3. GitHub repository'sini bağlayın
4. Root directory: `server`
5. Build command: `npm install`
6. Start command: `npm start`
7. Environment variables'ları ekleyin

## Sorun Giderme

### CORS Hatası
- Railway/Render URL'inin CORS ayarlarında olduğundan emin olun
- Vercel domain'lerinin proxy server'da tanımlı olduğundan emin olun

### API Bağlantı Hatası
- Railway/Render servisinin çalıştığından emin olun
- Health check endpoint'ini test edin: `https://YOUR_RAILWAY_URL/api/health`

### Environment Variables
- Production'da doğru URL'lerin kullanıldığından emin olun
- Vercel'de VITE_PROXY_BASE_URL_PRODUCTION'ın doğru olduğundan emin olun