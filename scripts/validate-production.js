#!/usr/bin/env node

// Production Configuration Validator
// This script validates that all required environment variables are set for production

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Required environment variables for production
const requiredEnvVars = [
  'VITE_TRENDYOL_ENV',
  'VITE_TRENDYOL_API_KEY',
  'VITE_TRENDYOL_API_SECRET',
  'VITE_TRENDYOL_INTEGRATION_CODE',
  'VITE_PROXY_BASE_URL_PRODUCTION',
  'NODE_ENV',
  'TRENDYOL_ENV'
];

// Read .env.production file
const envFile = path.join(__dirname, '../.env.production');

if (!fs.existsSync(envFile)) {
  console.error('❌ .env.production file not found!');
  process.exit(1);
}

const envContent = fs.readFileSync(envFile, 'utf8');
const envLines = envContent.split('\n');
const envVars = {};

// Parse environment variables
envLines.forEach(line => {
  if (line.trim() && !line.startsWith('#')) {
    const [key, value] = line.split('=');
    if (key && value) {
      envVars[key.trim()] = value.trim();
    }
  }
});

console.log('🔍 Validating production configuration...');

let isValid = true;
const missingVars = [];
const invalidVars = [];

// Check required variables
requiredEnvVars.forEach(varName => {
  if (!envVars[varName]) {
    missingVars.push(varName);
    isValid = false;
  } else if (envVars[varName].includes('your_') || envVars[varName].includes('_here')) {
    invalidVars.push(varName);
    isValid = false;
  }
});

// Check specific values
if (envVars.VITE_TRENDYOL_ENV !== 'production') {
  console.error('❌ VITE_TRENDYOL_ENV must be set to "production"');
  isValid = false;
}

if (envVars.NODE_ENV !== 'production') {
  console.error('❌ NODE_ENV must be set to "production"');
  isValid = false;
}

if (envVars.TRENDYOL_ENV !== 'production') {
  console.error('❌ TRENDYOL_ENV must be set to "production"');
  isValid = false;
}

// Check URL format
if (envVars.VITE_PROXY_BASE_URL_PRODUCTION && !envVars.VITE_PROXY_BASE_URL_PRODUCTION.startsWith('https://')) {
  console.error('❌ VITE_PROXY_BASE_URL_PRODUCTION must start with https://');
  isValid = false;
}

// Report results
if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => console.error(`   - ${varName}`));
}

if (invalidVars.length > 0) {
  console.error('❌ Environment variables with placeholder values:');
  invalidVars.forEach(varName => console.error(`   - ${varName}: ${envVars[varName]}`));
}

if (isValid) {
  console.log('✅ Production configuration is valid!');
  console.log('\n📋 Configuration summary:');
  console.log(`   Environment: ${envVars.VITE_TRENDYOL_ENV}`);
  console.log(`   API Key: ${envVars.VITE_TRENDYOL_API_KEY ? envVars.VITE_TRENDYOL_API_KEY.substring(0, 8) + '...' : 'Not set'}`);
  console.log(`   Integration Code: ${envVars.VITE_TRENDYOL_INTEGRATION_CODE ? envVars.VITE_TRENDYOL_INTEGRATION_CODE.substring(0, 8) + '...' : 'Not set'}`);
  console.log(`   Proxy URL: ${envVars.VITE_PROXY_BASE_URL_PRODUCTION}`);
  process.exit(0);
} else {
  console.error('\n❌ Production configuration validation failed!');
  console.error('Please update your .env.production file with correct values.');
  process.exit(1);
}