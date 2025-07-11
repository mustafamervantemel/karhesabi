# Production Deployment Instructions

## 1. DigitalOcean Droplet Deployment

### Prerequisites
- DigitalOcean Droplet (IP: 167.71.42.27)
- SSH access to the server
- Domain name (optional)

### Step 1: Prepare Server Environment
```bash
# Connect to your droplet
ssh root@167.71.42.27

# Update system
apt update && apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Install PM2 for process management
npm install -g pm2

# Install Nginx (optional, for reverse proxy)
apt install -y nginx
```

### Step 2: Clone and Setup Project
```bash
# Create project directory
mkdir -p /var/www/karhesabi
cd /var/www/karhesabi

# Clone repository
git clone https://github.com/mustafamervantemel/karhesabi.git .

# Install dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..
```

### Step 3: Configure Environment Variables
Update `.env.production` file with your production values:
```bash
# Copy production environment file
cp .env.production .env

# Edit production environment file
nano .env

# Required variables:
VITE_TRENDYOL_ENV=production
VITE_API_BASE_URL=https://karhesabi.vercel.app
VITE_PROXY_BASE_URL=https://karhesabi.vercel.app/api/trendyol
VITE_PROXY_BASE_URL_PRODUCTION=https://karhesabi.vercel.app/api/trendyol
VITE_TRENDYOL_API_KEY=your_production_api_key
VITE_TRENDYOL_API_SECRET=your_production_api_secret
VITE_TRENDYOL_INTEGRATION_CODE=your_integration_code
NODE_ENV=production
TRENDYOL_ENV=production
```

### Step 4: Build and Deploy
```bash
# Build for production
npm run build:production

# Start server with PM2
cd server
NODE_ENV=production TRENDYOL_ENV=production pm2 start trendyol-proxy.js --name karhesabi-server

# Save PM2 configuration
pm2 save
pm2 startup
```

### Step 5: Configure Nginx (Optional)
```nginx
# /etc/nginx/sites-available/karhesabi
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/karhesabi /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Step 6: SSL Certificate (Optional)
```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## 2. Automated Deployment Script

Use the provided deployment script:
```bash
# Make script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

## 3. Vercel Frontend Deployment

### Environment Variables for Vercel
```
VITE_TRENDYOL_ENV=production
VITE_API_BASE_URL=https://karhesabi.vercel.app
VITE_PROXY_BASE_URL=https://karhesabi.vercel.app/api/trendyol
VITE_PROXY_BASE_URL_PRODUCTION=https://karhesabi.vercel.app/api/trendyol
VITE_TRENDYOL_API_KEY=your_production_api_key
VITE_TRENDYOL_API_SECRET=your_production_api_secret
VITE_TRENDYOL_INTEGRATION_CODE=your_integration_code
```

### Deploy Command
```bash
# Deploy to Vercel
vercel --prod
```

## 4. Testing Production Deployment

### Health Check
```bash
# Check server health
curl https://karhesabi.vercel.app/api/health

# Check API proxy
curl -X POST https://karhesabi.vercel.app/api/trendyol/test-connection \
  -H "Content-Type: application/json" \
  -d '{"apiKey":"your_key","apiSecret":"your_secret"}'
```

### Frontend Testing
1. Visit your domain
2. Go to Integration page
3. Enter your Trendyol API credentials
4. Test connection
5. Verify all features work correctly

## 5. Monitoring and Maintenance

### PM2 Commands
```bash
# Check status
pm2 status

# View logs
pm2 logs karhesabi-server

# Restart service
pm2 restart karhesabi-server

# Stop service
pm2 stop karhesabi-server
```

### System Monitoring
```bash
# Check system resources
htop

# Check disk usage
df -h

# Check memory usage
free -h
```

## 6. Troubleshooting

### Common Issues

#### CORS Errors
- Ensure your domain is properly configured in CORS settings
- Check that proxy server is running
- Verify environment variables are set correctly

#### API Connection Issues
- Verify Trendyol API credentials are correct
- Check that IP address is whitelisted in Trendyol Partner Panel
- Ensure production API endpoints are being used

#### SSL Issues
- Check certificate validity: `openssl s_client -connect yourdomain.com:443`
- Verify Nginx configuration
- Check firewall settings

#### Performance Issues
- Monitor PM2 logs for errors
- Check server resources
- Optimize database queries if applicable

### Log Files
- PM2 logs: `~/.pm2/logs/`
- Nginx logs: `/var/log/nginx/`
- System logs: `/var/log/syslog`

## 7. Backup and Recovery

### Backup Strategy
```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf /backups/karhesabi_$DATE.tar.gz /var/www/karhesabi
```

### Recovery Steps
1. Stop PM2 processes
2. Restore from backup
3. Reinstall dependencies
4. Restart services

## 8. Security Considerations

- Keep system updated
- Use strong passwords
- Configure firewall properly
- Regular security audits
- Monitor access logs
- Use HTTPS everywhere