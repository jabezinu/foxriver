# Quick Start Guide - Optimizations

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies (2 minutes)

```bash
# Navigate to backend
cd backend

# Install new packages
npm install compression express-rate-limit

# Navigate back to root
cd ..
```

### Step 2: Create Database Indexes (1 minute)

```bash
cd backend
node scripts/add_database_indexes.js
cd ..
```

### Step 3: Verify Environment Variables (1 minute)

Check `backend/.env` has these variables:
```env
NODE_ENV=development
JWT_SECRET=your_secret_here
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173
MONGODB_URI=your_mongodb_uri
```

### Step 4: Test the Application (1 minute)

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Client
cd client
npm run dev

# Terminal 3 - Admin (optional)
cd admin
npm run dev
```

### Step 5: Verify Optimizations

Visit: `http://localhost:5000/api/health`

You should see:
```json
{
  "status": "OK",
  "message": "Foxriver API is running",
  "timestamp": "2026-01-12T...",
  "uptime": 123
}
```

---

## ✅ What's New?

### Security
- ✅ Rate limiting on all endpoints
- ✅ Security headers enabled
- ✅ Input sanitization active
- ✅ Request validation

### Performance
- ✅ Response compression (60-80% smaller)
- ✅ Database indexes (faster queries)
- ✅ Optimized queries
- ✅ Graceful shutdown

### Code Quality
- ✅ Centralized logging
- ✅ Error handling
- ✅ Service layer
- ✅ Constants file
- ✅ Response helpers

---

## 📝 Quick Reference

### Using the Logger

```javascript
const logger = require('../config/logger');

// Instead of console.log
logger.info('User logged in', { userId: user.id });
logger.error('Operation failed', { error: err.message });
logger.warn('Deprecated feature used');
logger.debug('Debug information');
```

### Using Error Handler

```javascript
const { asyncHandler, AppError } = require('../middlewares/errorHandler');

exports.myFunction = asyncHandler(async (req, res) => {
    if (!data) {
        throw new AppError('Data not found', 404);
    }
    res.json({ success: true, data });
});
```

### Using Validation

```javascript
const { validate, mongoIdValidation } = require('../middlewares/validation');

router.get('/:id', mongoIdValidation, validate, controller.getById);
```

### Using Response Helpers

```javascript
const { successResponse, errorResponse } = require('../helpers/response');

// Success
successResponse(res, { user }, 'User found');

// Error
errorResponse(res, 'User not found', 404);
```

---

## 🔧 Troubleshooting

### Issue: "Cannot find module 'compression'"
**Solution:** Run `npm install` in backend folder

### Issue: "Rate limit exceeded"
**Solution:** Wait 15 minutes or adjust limits in `backend/middlewares/security.js`

### Issue: "Indexes already exist"
**Solution:** This is normal, indexes are already created

### Issue: Logs not showing
**Solution:** Check NODE_ENV is set to 'development'

---

## 📚 Documentation

- **Full Report:** `CODEBASE_OPTIMIZATION_REPORT.md`
- **Implementation Guide:** `OPTIMIZATION_IMPLEMENTATION_GUIDE.md`
- **Final Summary:** `FINAL_OPTIMIZATION_SUMMARY.md`

---

## 🎯 Next Steps

1. ✅ Run the application and test
2. ✅ Review the optimization reports
3. ✅ Update your code to use new patterns
4. ✅ Add tests (recommended)
5. ✅ Setup monitoring (recommended)

---

## 💡 Tips

- Use `logger` instead of `console.log`
- Use `asyncHandler` for all async routes
- Use `AppError` for throwing errors
- Add validation to all routes
- Use response helpers for consistency

---

## 🆘 Need Help?

1. Check the documentation files
2. Review the code comments
3. Check the troubleshooting section
4. Review error logs

---

**Status:** ✅ Ready to Use  
**Version:** 1.0.0  
**Date:** January 12, 2026
