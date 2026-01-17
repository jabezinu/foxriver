#!/bin/bash

# High Traffic Setup Script for Everest Backend
# This script sets up all necessary components for high-traffic deployment

echo "=========================================="
echo "Everest High Traffic Setup"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${YELLOW}Warning: Not running as root. Some operations may require sudo.${NC}"
fi

# Step 1: Install Redis
echo -e "${GREEN}Step 1: Installing Redis...${NC}"
if command -v redis-server &> /dev/null; then
    echo "Redis is already installed"
else
    echo "Installing Redis..."
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get update
        sudo apt-get install -y redis-server
        sudo systemctl enable redis-server
        sudo systemctl start redis-server
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install redis
        brew services start redis
    else
        echo -e "${RED}Please install Redis manually for your OS${NC}"
    fi
fi

# Step 2: Install PM2 globally
echo -e "${GREEN}Step 2: Installing PM2...${NC}"
if command -v pm2 &> /dev/null; then
    echo "PM2 is already installed"
else
    npm install -g pm2
fi

# Step 3: Install Node.js dependencies
echo -e "${GREEN}Step 3: Installing Node.js dependencies...${NC}"
cd backend
npm install ioredis

# Step 4: Add database indexes
echo -e "${GREEN}Step 4: Adding database indexes...${NC}"
echo "Please run the following SQL script manually:"
echo "mysql -u root -p foxriver-db < backend/scripts/addIndexes.sql"
echo ""
read -p "Press enter when you've run the SQL script..."

# Step 5: Update environment variables
echo -e "${GREEN}Step 5: Updating environment variables...${NC}"
if ! grep -q "USE_REDIS" backend/.env; then
    echo "" >> backend/.env
    echo "# Redis Configuration" >> backend/.env
    echo "USE_REDIS=true" >> backend/.env
    echo "REDIS_HOST=localhost" >> backend/.env
    echo "REDIS_PORT=6379" >> backend/.env
    echo "# REDIS_PASSWORD=your_password" >> backend/.env
    echo "Added Redis configuration to .env"
else
    echo "Redis configuration already exists in .env"
fi

# Step 6: Update cache.js to use Redis
echo -e "${GREEN}Step 6: Updating cache implementation...${NC}"
if [ -f "backend/utils/cache.js" ]; then
    mv backend/utils/cache.js backend/utils/cache.js.backup
    cp backend/utils/redisCache.js backend/utils/cache.js
    echo "Updated cache.js to use Redis (backup created)"
fi

# Step 7: Test Redis connection
echo -e "${GREEN}Step 7: Testing Redis connection...${NC}"
if redis-cli ping | grep -q "PONG"; then
    echo -e "${GREEN}✓ Redis is running${NC}"
else
    echo -e "${RED}✗ Redis is not responding${NC}"
fi

# Step 8: Start with PM2
echo -e "${GREEN}Step 8: Starting application with PM2...${NC}"
cd backend
pm2 delete everest-backend 2>/dev/null
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

echo ""
echo "=========================================="
echo -e "${GREEN}Setup Complete!${NC}"
echo "=========================================="
echo ""
echo "Your application is now running in cluster mode with Redis caching."
echo ""
echo "Useful commands:"
echo "  pm2 status          - Check application status"
echo "  pm2 logs            - View logs"
echo "  pm2 monit           - Monitor resources"
echo "  pm2 restart all     - Restart all instances"
echo "  redis-cli           - Access Redis CLI"
echo ""
echo "Next steps:"
echo "1. Set up Cloudflare CDN for your domain"
echo "2. Configure Nginx with the provided nginx.conf.example"
echo "3. Monitor performance with: pm2 monit"
echo "4. Check Redis cache: redis-cli INFO stats"
echo ""
