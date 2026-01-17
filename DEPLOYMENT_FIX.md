# Deployment Fix Guide - Team Page 429 Error

## Problem Summary
The Team page was experiencing:
1. **429 (Too Many Requests)** errors due to strict rate limiting
2. **MIME type errors** when JavaScript modules couldn't load (server returned HTML error pages instead of JS files)

## Changes Made

### 1. Backend Rate Limiting (backend/middlewares/security.js)
- **Increased rate limit** from 100 to 300 requests per minute
- **Added skip logic** to exclude static files from rate limiting
- **Modified security headers** to not interfere with static assets

### 2. Backend Server Configuration (backend/server.js)
- **Moved static file serving** before rate limiting middleware
- This ensures uploads and static assets are never rate-limited

### 3. Client-Side Error Handling (client/src/services/api.js)
- **Added automatic retry** for 429 errors with 2-second delay
- **Better error handling** in axios interceptor

### 4. Team Page Component (client/src/pages/Team.jsx)
- **Added specific 429 error message** to inform users
- **Added small delay** before API calls to prevent rapid successive requests

## Deployment Steps

### Step 1: Update Backend
```bash
cd backend
# The changes are already in the code, just restart the server
npm start
# Or if using PM2:
pm2 restart everest-backend
```

### Step 2: Rebuild and Deploy Client
```bash
cd client
npm run build
# Copy the dist folder to your web server
# Example: scp -r dist/* user@server:/var/www/everest/client/dist/
```

### Step 3: Configure Nginx (Recommended)
If you're using Nginx, update your configuration to match `nginx.conf.example`:
```bash
# Copy the example config
sudo cp nginx.conf.example /etc/nginx/sites-available/everest
sudo ln -s /etc/nginx/sites-available/everest /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 4: Verify the Fix
1. Clear browser cache (Ctrl+Shift+Delete)
2. Navigate to the Team page
3. Refresh multiple times to test rate limiting
4. Check browser console for errors

## Additional Recommendations

### 1. Use a CDN
Consider using a CDN (like Cloudflare) to:
- Cache static assets globally
- Reduce load on your origin server
- Provide additional DDoS protection

### 2. Monitor Rate Limits
Keep an eye on your server logs to see if 300 requests/minute is sufficient:
```bash
# Check for 429 errors in logs
grep "429" /var/log/nginx/access.log | wc -l
```

### 3. Implement Request Caching
Consider adding Redis or similar caching for frequently accessed endpoints like:
- `/api/referrals/downline`
- `/api/referrals/commissions`
- `/api/referrals/salary`

### 4. Database Optimization
The referral queries can be heavy. Consider:
- Adding database indexes on `referrerId` column
- Implementing query result caching
- Using database connection pooling

## Testing Checklist
- [ ] Backend server restarts without errors
- [ ] Client builds successfully
- [ ] Team page loads without 429 errors
- [ ] JavaScript modules load with correct MIME types
- [ ] Multiple rapid refreshes don't break the page
- [ ] Rate limiting still works for actual abuse scenarios

## Rollback Plan
If issues persist:
1. Revert `backend/middlewares/security.js` to previous version
2. Increase rate limit even further (e.g., 500 requests/minute)
3. Consider removing rate limiting entirely for authenticated users

## Support
If you continue experiencing issues:
1. Check browser console for specific error messages
2. Check server logs: `tail -f /var/log/nginx/error.log`
3. Check backend logs: `pm2 logs everest-backend`
4. Verify all environment variables are set correctly
