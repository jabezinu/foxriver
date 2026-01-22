#!/bin/bash

# Script to deploy bank account fixes to production server
# Run this on your deployed server

echo "🚀 Starting bank account fix deployment..."

# Navigate to backend directory
cd backend

echo "📦 Installing dependencies..."
npm install

echo "🔧 Running bank account diagnosis..."
node scripts/diagnose-bank-account-issue.js

echo "🛠️ Running bank account field fix..."
node scripts/fix-bank-account-field.js

echo "🔄 Restarting server..."
# Uncomment the appropriate restart command for your deployment
# pm2 restart all
# systemctl restart your-app-name
# docker-compose restart backend

echo "✅ Bank account fix deployment completed!"
echo ""
echo "📋 Next steps:"
echo "1. Check your application logs for any errors"
echo "2. Test the bank account functionality in the client"
echo "3. Visit /api/debug/diagnose-bank-accounts to see diagnosis results"
echo "4. Remove debug components from production when issue is resolved"