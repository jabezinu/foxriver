# Authentication Fix - Instant Logout Issue

**Date**: January 15, 2026  
**Issue**: Users were being logged out immediately after login

---

## Root Causes Identified

### 1. Backend Auth Middleware (Mongoose → Sequelize)
**File**: `backend/middlewares/auth.js`

**Problem**: Using Mongoose syntax with Sequelize models
```javascript
// ❌ Before (Mongoose)
req.user = await User.findById(decoded.id).select('-password -transactionPassword');

// ✅ After (Sequelize)
req.user = await User.findByPk(decoded.id, {
    attributes: { exclude: ['password', 'transactionPassword'] }
});
req.user = req.user.toJSON(); // Convert to plain object
```

### 2. Frontend Timeout Too Aggressive
**File**: `client/src/store/authStore.js`

**Problem**: 5-minute inactivity timeout was too short and could trigger on page refresh

**Changes**:
- Increased timeout from **5 minutes** to **30 minutes**
- Added better timestamp handling
- Ensured `lastActivity` is set on login and verification

---

## Files Modified

### Backend
1. ✅ `backend/controllers/authController.js` - Fixed Mongoose → Sequelize
2. ✅ `backend/middlewares/auth.js` - Fixed Mongoose → Sequelize

### Frontend
3. ✅ `client/src/store/authStore.js` - Increased timeout to 30 minutes

---

## How Authentication Works Now

### Login Flow
1. User submits credentials
2. Backend validates and returns JWT token
3. Frontend stores token + sets `lastActivity` timestamp
4. User is marked as authenticated

### Token Verification Flow
1. On app load, `verifyToken()` is called
2. Checks if token exists
3. Checks if last activity was within 30 minutes
4. Calls backend `/api/auth/verify` endpoint
5. Backend validates JWT and returns user data
6. Frontend updates `lastActivity` timestamp
7. User stays logged in

### Auto-Logout Conditions
- No token in localStorage
- Last activity > 30 minutes ago
- Backend returns 401 (invalid/expired token)
- Manual logout

---

## Testing

### Test Login
```bash
curl -X POST http://localhost:5002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "+251900000000", "password": "admin123"}'
```

### Test Token Verification
```bash
curl -X GET http://localhost:5002/api/auth/verify \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Session Management

**Inactivity Timeout**: 30 minutes  
**Token Expiry**: 30 days (JWT setting)  
**Activity Tracking**: Updates on every API call via interceptor

---

## Additional Notes

### LocalStorage Keys
- `foxriver_token` - JWT authentication token
- `foxriver_last_activity` - Timestamp of last user activity
- `foxriver_language` - User's language preference

### Axios Interceptor
The API client automatically:
- Adds `Authorization: Bearer {token}` header to all requests
- Redirects to `/login` on 401 responses
- Updates `lastActivity` on successful requests

---

## Status

✅ **Backend auth middleware fixed** - Using Sequelize properly  
✅ **Frontend timeout increased** - 30 minutes instead of 5  
✅ **Login working** - Users stay logged in  
✅ **Token verification working** - Proper user data returned  

---

## Next Steps

If users still experience logout issues:
1. Check browser console for errors
2. Verify token is being stored in localStorage
3. Check network tab for 401 responses
4. Ensure backend is running and accessible
5. Clear browser cache and localStorage

---

**Fixed By**: Kiro AI Assistant  
**Last Updated**: January 15, 2026
