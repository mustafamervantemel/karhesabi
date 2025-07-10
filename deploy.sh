#!/bin/bash

# DigitalOcean Deployment Script
# IP: 167.71.42.27

echo "🚀 Starting deployment to DigitalOcean..."

# SSH bağlantısı kontrol et
echo "📡 Checking SSH connection..."
ssh -o ConnectTimeout=10 root@167.71.42.27 "echo 'SSH connection successful'"

if [ $? -ne 0 ]; then
    echo "❌ SSH connection failed. Please check:"
    echo "1. SSH key is added to server"
    echo "2. Server is running"
    echo "3. IP address is correct"
    exit 1
fi

# Server'a deploy et
echo "📦 Deploying to server..."
ssh root@167.71.42.27 << 'EOF'
    # Update system
    apt update

    # Install Node.js if not exists
    if ! command -v node &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt-get install -y nodejs
    fi

    # Install PM2 if not exists
    if ! command -v pm2 &> /dev/null; then
        npm install -g pm2
    fi

    # Create project directory
    mkdir -p /var/www/karhesabi
    cd /var/www/karhesabi

    # Clone or pull latest code
    if [ -d ".git" ]; then
        echo "📥 Pulling latest changes..."
        git pull origin main
    else
        echo "📥 Cloning repository..."
        git clone https://github.com/mustafamervantemel/karhesabi.git .
    fi

    # Install dependencies
    echo "📦 Installing dependencies..."
    npm install

    # Install server dependencies
    cd server
    npm install

    # Copy test environment file
    cd ..
    cp .env.test .env

    # Build frontend
    echo "🔨 Building frontend..."
    npm run build

    # Stop existing PM2 process
    pm2 stop karhesabi-server || true
    pm2 delete karhesabi-server || true

    # Start server with PM2
    echo "🚀 Starting server..."
    cd server
    TRENDYOL_ENV=test pm2 start trendyol-proxy.js --name karhesabi-server

    # Show PM2 status
    pm2 status

    echo "✅ Deployment completed!"
    echo "🌐 Server accessible at: http://167.71.42.27:4000"
EOF

echo "✅ Deployment script completed!"
echo "🌐 Your application should be available at: http://167.71.42.27:4000"