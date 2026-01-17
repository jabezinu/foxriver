# 🚀 Production Deployment Checklist

## Pre-Deployment Summary

### ✅ Code Changes (Already Applied)
- Rate limiting increased to 1000 req/min
- Response caching added (2 minutes)
- Better error handling
- Static file optimization

### 📊 Database Changes
**NO SCHEMA CHANGES** - Only performance indexes (optional but recommended)

---

## Step-by-Step Deployment

### Step 1: Backup Everything (5 minutes)

```bash
# 1. Backup remote database
mysqldump -h your-remote-host -u your-user -p your-database > backup_$(date +%Y%m%d).sql

# 2. Backup current backend code
ssh your-server "cd /path/to/backend && tar -czf backup_$(date +%Y%m%d).tar.gz ."

# 3. Backup current client
ssh your-server "cd /path/to/client && tar -czf backup_$(date +%Y%m%d).tar.gz ."
```

---

### Step 2: Add Database Indexes (5 minutes) ⚡ RECOMMENDED

**This is SAFE and makes queries 10-50x faster!**

#### Option A: Using npm script (Easiest - No terminal needed!)

```bash
cd backend
npm run add-indexes
```

This will:
- ✅ Connect to your remote database using .env settings
- ✅ Add all necessary indexes automatically
- ✅ Skip indexes that already exist
- ✅ Show you what was added

#### Option B: Using SQL file (If you have MySQL terminal access)

```bash
# From your local machine
mysql -h your-remote-host -u your-user -p your-database < backend/scripts/addIndexes.sql

# Or copy and run on server
scp backend/scripts/addIndexes.sql your-server:/tmp/
ssh your-server
mysql -h localhost -u your-user -p your-database < /tmp/addIndexes.sql
```

**What this does:**
- ✅ Adds indexes to speed up queries
- ✅ NO data changes
- ✅ NO schema changes
- ✅ Safe to run multiple times
- ⏱️ Takes 1-5 minutes depending on data size

**Skip this if:**
- You have less than 1,000 users (not needed yet)
- You want to deploy quickly and add later

---

### Step 3: Deploy Backend (10 minutes)

```bash
# 1. Upload backend files
cd backend
rsync -avz --exclude 'node_modules' --exclude 'logs' --exclude 'uploads' \
  . your-server:/path/to/backend/

# 2. SSH to server
ssh your-server

# 3. Install dependencies (if needed)
cd /path/to/backend
npm install

# 4. Restart backend
# If using PM2:
pm2 restart everest-backend

# If using npm:
npm start

# If using systemd:
sudo systemctl restart everest-backend
```

**Verify backend is running:**
```bash
curl http://localhost:5002/api/health
# Should return: {"status":"OK","message":"Foxriver API is running",...}
```

---

### Step 4: Deploy Client (10 minutes)

```bash
# 1. Build client locally
cd client
npm run build

# 2. Upload to server
rsync -avz --delete dist/ your-server:/var/www/everest/client/dist/

# Or if using SCP:
scp -r dist/* your-server:/var/www/everest/client/dist/
```

**Verify client is accessible:**
```bash
curl https://everest12.com
# Should return HTML
```

---

### Step 5: Test Everything (5 minutes)

#### Backend Tests:
```bash
# Health check
curl https://everest-db.everest12.com/api/health

# Auth endpoint (should return 401 or validation error)
curl https://everest-db.everest12.com/api/auth/verify

# Rate limit test (should allow 1000 req/min)
for i in {1..10}; do curl https://everest-db.everest12.com/api/health; done
```

#### Frontend Tests:
1. ✅ Open https://everest12.com
2. ✅ Login with test account
3. ✅ Navigate to Team page
4. ✅ Refresh Team page 5-10 times (should not get 429 error)
5. ✅ Check browser console (no MIME type errors)
6. ✅ Check Network tab (JS files load correctly)

---

### Step 6: Monitor (First 30 minutes)

```bash
# Watch backend logs
pm2 logs everest-backend
# or
tail -f /path/to/backend/logs/*.log

# Watch for errors
grep "ERROR" /path/to/backend/logs/*.log

# Watch for 429 errors
grep "429" /var/log/nginx/access.log

# Monitor server resources
htop
# or
top
```

**What to watch for:**
- ❌ 429 errors (rate limiting issues)
- ❌ 500 errors (server errors)
- ❌ High CPU usage (>80%)
- ❌ High memory usage (>80%)
- ✅ Response times <500ms
- ✅ No JavaScript errors in browser console

---

## Rollback Plan (If Something Goes Wrong)

### Quick Rollback (5 minutes)

```bash
# 1. Restore backend
ssh your-server
cd /path/to/backend
tar -xzf backup_YYYYMMDD.tar.gz
pm2 restart everest-backend

# 2. Restore client
cd /var/www/everest/client/dist
tar -xzf backup_YYYYMMDD.tar.gz

# 3. Restore database (if you ran indexes and want to remove them)
# NOTE: Usually not needed, indexes are safe to keep
mysql -h your-host -u your-user -p your-database < backup_YYYYMMDD.sql
```

---

## Post-Deployment Checklist

### Immediate (First Hour)
- [ ] Team page loads without errors
- [ ] No 429 errors in logs
- [ ] JavaScript modules load correctly
- [ ] Users can login and navigate
- [ ] All API endpoints responding
- [ ] No spike in error rate

### First Day
- [ ] Monitor server resources (CPU, memory, disk)
- [ ] Check error logs for patterns
- [ ] Verify cache is working (check response times)
- [ ] Test from different devices/browsers
- [ ] Monitor user complaints/feedback

### First Week
- [ ] Review performance metrics
- [ ] Check database query performance
- [ ] Monitor rate limit hits
- [ ] Plan for next scaling phase if needed

---

## Performance Expectations

### Before Deployment:
- Rate limit: 100 req/min
- No caching
- Team page: 200-500ms response time
- Capacity: ~1,000 users

### After Deployment:
- Rate limit: 1,000 req/min (10x improvement)
- 2-minute caching (95% reduction in DB load)
- Team page: 50-100ms response time (cached)
- Capacity: 5,000-10,000 users

### With Database Indexes:
- Query speed: 10-50x faster
- Team page: 20-50ms response time
- Can handle complex queries easily
- Capacity: 10,000-50,000 users

---

## Common Issues & Solutions

### Issue: Still getting 429 errors
**Solution:**
```javascript
// Increase rate limit in backend/middlewares/security.js
max: 2000, // or higher
```

### Issue: Slow response times
**Solution:**
1. Check if indexes are added: `SHOW INDEX FROM users;`
2. Increase cache time to 5 minutes
3. Check database connection pool

### Issue: High memory usage
**Solution:**
1. Restart backend: `pm2 restart all`
2. Consider adding Redis (see HIGH_TRAFFIC_SETUP.md)
3. Reduce cache TTL if needed

### Issue: JavaScript MIME type errors
**Solution:**
1. Clear browser cache
2. Check Nginx configuration (use nginx.conf.example)
3. Verify static files are served correctly

---

## Environment Variables Check

Make sure these are set on your server:

```bash
# Backend .env
NODE_ENV=production
PORT=5002
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name
JWT_SECRET=your-secret-key

# Optional (for Redis later)
# USE_REDIS=true
# REDIS_HOST=localhost
# REDIS_PORT=6379
```

```bash
# Client .env (used during build)
VITE_API_URL=https://everest-db.everest12.com/api
```

---

## Quick Commands Reference

```bash
# Backend
pm2 status                    # Check status
pm2 logs everest-backend      # View logs
pm2 restart everest-backend   # Restart
pm2 monit                     # Monitor resources

# Database
mysql -h host -u user -p db   # Connect to DB
SHOW INDEX FROM users;        # Check indexes
SHOW PROCESSLIST;             # Check queries

# Nginx
sudo nginx -t                 # Test config
sudo systemctl reload nginx   # Reload
tail -f /var/log/nginx/error.log  # View errors

# Server
htop                          # Monitor resources
df -h                         # Check disk space
free -h                       # Check memory
```

---

## Success Criteria

✅ **Deployment is successful if:**
1. Team page loads without errors
2. No 429 errors for normal usage
3. Response times <500ms
4. No JavaScript console errors
5. Users can navigate all pages
6. Backend health check returns OK
7. Server resources <70% usage

---

## Need Help?

- Check logs: `pm2 logs` or `tail -f logs/*.log`
- Review guides: `HIGH_TRAFFIC_SETUP.md`, `DEPLOYMENT_FIX.md`
- Test endpoints: Use curl or Postman
- Monitor: `pm2 monit` or `htop`

**Remember:** You can always rollback if needed!
