# Wealth Fund Troubleshooting Guide

## Issue: Wealth funds not visible on client page

### Steps to Diagnose and Fix

## Step 1: Check Database
Run this command to see what funds exist:
```bash
node backend/check_funds.js
```

**Expected Output:**
- Should show at least 1 fund with "Active: ✅ YES"
- If no funds exist, create them in the admin panel first
- If funds exist but all are inactive, activate them in admin panel

## Step 2: Verify Environment Configuration

### Client Environment File
The client **MUST** have a `.env` file with the API URL.

**File:** `client/.env`
```env
VITE_API_URL=http://localhost:5002/api
```

⚠️ **IMPORTANT**: After creating or modifying `.env`, you MUST restart the Vite dev server!

### How to Restart Client Dev Server
1. Stop the current dev server (Ctrl+C)
2. Run: `npm run dev` in the client directory
3. Or: `cd client && npm run dev`

## Step 3: Check Backend is Running

Verify the backend server is running on port 5002:
```bash
# Check if backend is running
curl http://localhost:5002/api/health
```

If not running, start it:
```bash
cd backend
npm start
```

## Step 4: Test API Directly

### Get a User Token
1. Login to the client app
2. Open browser DevTools (F12)
3. Go to Console tab
4. Run: `localStorage.getItem('foxriver_token')`
5. Copy the token value

### Test the API
```bash
node backend/test_wealth_api.js YOUR_TOKEN_HERE
```

**Expected Response:**
```
✅ API Response Status: 200
✅ Success: true
✅ Funds returned: 2
```

## Step 5: Check Browser Console

1. Open the client app in browser
2. Navigate to `/wealth` page
3. Open DevTools Console (F12)
4. Look for these debug messages:

```
🔍 Fetching funds from: http://localhost:5002/api/wealth/funds
🔑 Token exists: true
✅ API Response: {success: true, data: Array(2)}
📊 Funds count: 2
```

### Common Console Errors

#### Error: "VITE_API_URL is undefined"
**Solution:** Create `client/.env` file and restart dev server

#### Error: "Network Error" or "ERR_CONNECTION_REFUSED"
**Solution:** Backend is not running. Start it with `npm start` in backend directory

#### Error: 401 Unauthorized
**Solution:** Token is invalid or expired. Logout and login again

#### Error: "Funds count: 0" but database has active funds
**Solution:** Check if funds are marked as active in database

## Step 6: Verify Image Paths

If funds appear but images don't load:

1. Check browser Network tab (F12 → Network)
2. Look for failed image requests
3. Verify image URLs are like: `http://localhost:5002/uploads/wealth/wealth-123456.jpg`
4. Check if `uploads/wealth/` directory exists in backend
5. Verify images are actually saved there

## Quick Fix Checklist

- [ ] Backend server is running on port 5002
- [ ] Client `.env` file exists with `VITE_API_URL=http://localhost:5002/api`
- [ ] Client dev server has been restarted after creating `.env`
- [ ] At least one wealth fund exists in database
- [ ] At least one fund has `isActive: true`
- [ ] User is logged in (token exists in localStorage)
- [ ] Browser console shows successful API response
- [ ] Images exist in `backend/uploads/wealth/` directory

## Manual Database Check

If you want to manually check the database:

```sql
-- Connect to MySQL
mysql -u root -p

-- Use the database
USE foxriver;

-- Check wealth funds
SELECT id, name, isActive, image, days, dailyProfit, minimumDeposit 
FROM wealth_funds;

-- Activate all funds (if needed)
UPDATE wealth_funds SET isActive = 1;
```

## Create Test Fund via Admin Panel

1. Login to admin panel
2. Go to "Wealth Management"
3. Click "Create New Fund"
4. Fill in:
   - Name: Test Fund
   - Image: Upload any image
   - Duration: 30 days
   - Profit Model: Percentage
   - Daily Return: 5%
   - Minimum Stake: 100 ETB
   - Description: Test fund for verification
   - **IMPORTANT:** Toggle "Set as Active" to ON (green)
5. Click "Publish Fund"
6. Refresh client page

## Still Not Working?

If you've completed all steps and still see nothing:

1. **Clear browser cache and localStorage:**
   ```javascript
   // In browser console
   localStorage.clear();
   location.reload();
   ```
   Then login again

2. **Check for JavaScript errors:**
   - Open Console (F12)
   - Look for any red error messages
   - Share the error messages for further debugging

3. **Verify API response in Network tab:**
   - Open DevTools → Network tab
   - Navigate to /wealth page
   - Find the request to `/api/wealth/funds`
   - Check the Response tab
   - Should show: `{success: true, data: [...]}`

4. **Check CORS issues:**
   - If you see CORS errors in console
   - Verify backend CORS configuration allows localhost:5173 (Vite default port)

## Environment Variables Reference

### Client (.env)
```env
VITE_API_URL=http://localhost:5002/api
```

### Backend (.env)
```env
PORT=5002
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=foxriver
JWT_SECRET=your_secret
```

## Contact Points

If issue persists, provide:
1. Output of `node backend/check_funds.js`
2. Browser console logs (screenshot)
3. Network tab showing the API request/response
4. Backend console logs
