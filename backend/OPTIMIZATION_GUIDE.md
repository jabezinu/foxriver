# Backend Optimization Guide

## Completed Optimizations

### 1. Dependency Cleanup ✅
- **Removed unused packages**: ytpl, sequelize, mysql2, and all related dependencies
- **Cleaned up node_modules**: Removed 28 extraneous packages
- **Result**: Reduced package count from 190+ to 162 packages

### 2. Test & Utility Scripts Cleanup ✅
Removed unnecessary files from root directory:
- `promote-admin.js` - One-time admin promotion script
- `quick-fix-tasks.js` - Development utility
- `setup-tasks-guide.js` - Setup documentation
- `test_bank_duplicate.js` - Test script
- `test_membership_levels.js` - Test script
- `test-auto-generation.js` - Test script
- `verify_bank.js` - Verification script
- `uploads.zip` - Unnecessary archive

**Note**: Migration and verification scripts in `scripts/` folder are kept as they may be needed for production maintenance.

### 3. Database Connection Optimization ✅
Enhanced `config/database.js` with:
- **Connection pooling**: maxPoolSize: 10, minPoolSize: 2
- **Timeout configuration**: socketTimeoutMS: 45s, serverSelectionTimeoutMS: 5s
- **Connection event handlers**: Error, disconnect, and reconnect logging
- **Proper logging**: Using centralized logger instead of console.log

### 4. Documentation ✅
- Created comprehensive `README.md`
- Added `.env.example` for environment setup
- Created this optimization guide

## Performance Best Practices

### Database Queries
```javascript
// ✅ Good - Use lean() for read-only queries
const users = await User.find().lean();

// ✅ Good - Select only needed fields
const users = await User.find().select('name email');

// ✅ Good - Use indexes for frequently queried fields
// See scripts/add_database_indexes.js

// ❌ Bad - Loading unnecessary data
const users = await User.find(); // Loads all fields and Mongoose overhead
```

### Error Handling
```javascript
// ✅ Good - Use asyncHandler wrapper
const { asyncHandler } = require('../middlewares/errorHandler');

exports.getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    res.json({ success: true, user });
});

// ❌ Bad - Manual try-catch everywhere
exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
```

### Response Helpers
```javascript
// ✅ Good - Use standardized response helpers
const { successResponse, errorResponse } = require('../helpers/response');

exports.getUser = async (req, res) => {
    const user = await User.findById(req.params.id);
    return successResponse(res, { user }, 'User retrieved successfully');
};

// ❌ Bad - Inconsistent response formats
res.json({ success: true, data: user, msg: 'Success' });
```

## Recommended Future Optimizations

### 0. Replace Deprecated ytpl Package ⚠️
The `ytpl` package is deprecated and should be replaced:

**Option 1: Use YouTube Data API v3**
```javascript
// Install: npm install googleapis
const { google } = require('googleapis');
const youtube = google.youtube({ version: 'v3', auth: process.env.YOUTUBE_API_KEY });

const getPlaylistVideos = async (playlistId) => {
    const response = await youtube.playlistItems.list({
        part: 'snippet',
        playlistId: playlistId,
        maxResults: 50
    });
    
    return response.data.items.map(item => ({
        videoId: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        videoUrl: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`
    }));
};
```

**Option 2: Manual Video Entry**
Remove playlist sync functionality and require admins to add videos manually through the admin panel.

### 1. Implement Caching
```javascript
// Use Redis for frequently accessed data
const redis = require('redis');
const client = redis.createClient();

// Cache user data
const getUserWithCache = async (userId) => {
    const cached = await client.get(`user:${userId}`);
    if (cached) return JSON.parse(cached);
    
    const user = await User.findById(userId).lean();
    await client.setex(`user:${userId}`, 3600, JSON.stringify(user));
    return user;
};
```

### 2. Add Database Indexes
Run the indexing script:
```bash
node scripts/add_database_indexes.js
```

Key indexes to add:
- User: phone (unique), membershipLevel, referrerId
- Deposit: user, status, createdAt
- Withdrawal: user, status, createdAt
- Task: status, membershipLevel
- Commission: user, createdAt

### 3. Implement Request Compression
Already implemented with `compression` middleware, but ensure it's working:
```javascript
// In server.js - already added
app.use(compression());
```

### 4. Optimize Image Uploads
Current implementation uploads to Cloudinary, which is good. Consider:
- Image resizing before upload
- WebP format conversion
- Lazy loading on frontend

### 5. Add API Response Caching
```javascript
// Cache GET requests for static data
const apicache = require('apicache');
const cache = apicache.middleware;

// Cache for 5 minutes
app.get('/api/memberships', cache('5 minutes'), getMemberships);
```

### 6. Implement Pagination Everywhere
```javascript
// Use the pagination helper
const { paginatedResponse } = require('../helpers/response');

exports.getUsers = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const users = await User.find().skip(skip).limit(limit).lean();
    const total = await User.countDocuments();
    
    return paginatedResponse(res, users, page, limit, total);
};
```

### 7. Add Request Logging
```javascript
// Add morgan for HTTP request logging
const morgan = require('morgan');
app.use(morgan('combined'));
```

### 8. Optimize Cloudinary Configuration
```javascript
// In config/cloudinary.js - add transformation defaults
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

// Use transformations when uploading
const result = await cloudinary.uploader.upload(file, {
    folder: 'transactions',
    transformation: [
        { width: 1000, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
    ]
});
```

### 9. Add Health Check Monitoring
Already implemented at `/api/health`, but consider adding:
- Database connection status
- Memory usage
- Response time metrics

### 10. Implement Rate Limiting Per User
```javascript
// Current implementation is IP-based
// Consider user-based rate limiting
const rateLimit = require('express-rate-limit');

const createAccountLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    keyGenerator: (req) => req.user?.id || req.ip
});
```

## Monitoring Checklist

- [ ] Set up error tracking (e.g., Sentry)
- [ ] Monitor database query performance
- [ ] Track API response times
- [ ] Monitor memory usage
- [ ] Set up log aggregation
- [ ] Configure alerts for errors
- [ ] Monitor rate limit hits
- [ ] Track Cloudinary usage

## Security Checklist

- [x] Rate limiting implemented
- [x] Input sanitization
- [x] Security headers
- [x] JWT authentication
- [x] Password hashing
- [ ] Add helmet.js for additional security
- [ ] Implement CSRF protection
- [ ] Add API versioning
- [ ] Set up SSL/TLS in production
- [ ] Regular dependency updates

## Performance Metrics to Track

1. **Response Time**: Target < 200ms for most endpoints
2. **Database Query Time**: Target < 50ms per query
3. **Memory Usage**: Monitor for leaks
4. **CPU Usage**: Should stay below 70% under normal load
5. **Error Rate**: Target < 0.1%
6. **Uptime**: Target 99.9%

## Load Testing

Use tools like:
- Apache Bench (ab)
- Artillery
- k6

Example:
```bash
# Test with 100 concurrent users
ab -n 1000 -c 100 http://localhost:5002/api/health
```

## Conclusion

The backend has been significantly cleaned up and optimized. Key improvements:
- 28 fewer packages (15% reduction)
- Better database connection handling
- Removed 8 unnecessary files
- Improved documentation
- Established optimization patterns

Continue monitoring and implementing the recommended optimizations as the application scales.
