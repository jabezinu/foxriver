# Spin the Wheel - Quick Setup Guide

## Installation Steps

### 1. Backend Setup
No additional dependencies needed - the feature uses existing packages.

### 2. Start the Backend Server
```bash
cd backend
npm run dev
```

The spin routes will be automatically loaded at:
- `http://localhost:5000/api/spin`

### 3. Start the Client
```bash
cd client
npm run dev
```

Access the spin wheel at:
- `http://localhost:5173/spin`

### 4. Start the Admin Panel
```bash
cd admin
npm run dev
```

Access spin results at:
- `http://localhost:5174/spin-results`

## Quick Test

### Test as User:
1. Login to client application
2. Ensure you have at least 10 ETB in personal wallet
3. Navigate to `/spin` or click "Spin" from home page
4. Click "SPIN (10 ETB)" button
5. Watch the animation and see your result

### Test as Admin:
1. Login to admin panel
2. Click "Spin Results" in sidebar
3. View statistics and all spin records
4. Test filters and CSV export

## API Testing with cURL

### Spin the Wheel
```bash
curl -X POST http://localhost:5000/api/spin \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Get User History
```bash
curl http://localhost:5000/api/spin/history \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get All Results (Admin)
```bash
curl http://localhost:5000/api/spin/admin/all \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

## Verification Checklist

✅ Backend server running without errors
✅ Spin routes registered in server.js
✅ SpinResult model created in database
✅ Client can access /spin page
✅ Admin can access /spin-results page
✅ Spin button works and deducts 10 ETB
✅ Win/loss results display correctly
✅ Balance updates properly
✅ History shows past spins
✅ Admin panel shows all spins with stats

## Troubleshooting

### Issue: "Insufficient balance" error
**Solution**: Deposit funds or add balance via admin panel

### Issue: Spin button disabled
**Solution**: Check that personalWallet has at least 10 ETB

### Issue: Admin page shows no data
**Solution**: Ensure at least one spin has been performed

### Issue: Animation not smooth
**Solution**: Check browser performance, reduce other tabs

### Issue: 404 on /api/spin
**Solution**: Verify backend server is running and routes are loaded

## Database Verification

Check if SpinResult collection exists:
```javascript
// In MongoDB shell or Compass
db.spinresults.find().limit(5)
```

## Feature is Ready! 🎉

The Spin the Wheel feature is now fully integrated and ready to use. Users can start spinning immediately after ensuring they have sufficient balance.
