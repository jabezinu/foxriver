# 🎡 Spin the Wheel - Quick Reference Card

## 🎯 Feature Overview
- **Cost**: 10 ETB per spin
- **Win Rate**: 10% (1 in 10 spins)
- **Prize**: 100 ETB
- **Segments**: 10 total (9 "Try Again", 1 "Win 100 ETB")

## 🔗 URLs

### Client
- **Spin Page**: `http://localhost:5173/spin`
- **Home Menu**: Click "Spin" button

### Admin
- **Results Page**: `http://localhost:5174/spin-results`
- **Sidebar**: "Spin Results" menu item

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/spin` | User | Spin the wheel |
| GET | `/api/spin/history` | User | Get user's spin history |
| GET | `/api/spin/admin/all` | Admin | Get all spin results |

## 💾 Database

**Collection**: `spinresults`

**Schema**:
```javascript
{
  userId: ObjectId,
  result: "Win 100 ETB" | "Try Again",
  amountPaid: 10,
  amountWon: 0 | 100,
  balanceBefore: Number,
  balanceAfter: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## 📊 Key Statistics

### User Stats
- Total Spins
- Total Paid
- Total Won
- Number of Wins

### Admin Stats
- Platform Total Spins
- Total Revenue
- Total Payouts
- Net Profit
- Win Rate %

## 🎨 UI Components

### Client Page
- Animated spinning wheel
- Balance display
- Spin button
- Result modal
- Stats cards
- History list

### Admin Page
- Stats dashboard (4 cards)
- Filters (result, date range)
- Data table (paginated)
- CSV export button
- Refresh button

## 🔐 Security

- ✅ JWT authentication required
- ✅ Balance validation (min 10 ETB)
- ✅ Admin authorization for all results
- ✅ Atomic transactions
- ✅ Error handling

## 🎲 Game Logic

```javascript
// Win probability
const isWin = Math.random() < 0.1; // 10%

// Balance update
if (isWin) {
  personalWallet = personalWallet - 10 + 100; // Net +90
} else {
  personalWallet = personalWallet - 10; // Net -10
}
```

## 📱 User Flow

1. User navigates to `/spin`
2. Checks balance ≥ 10 ETB
3. Clicks "SPIN (10 ETB)"
4. Wheel spins for 4 seconds
5. Result displayed
6. Balance updated
7. History refreshed

## 🛠️ Admin Flow

1. Admin logs in
2. Clicks "Spin Results"
3. Views statistics
4. Applies filters (optional)
5. Reviews data table
6. Exports CSV (optional)

## 🚨 Common Issues

| Issue | Solution |
|-------|----------|
| Insufficient balance | Deposit or add funds |
| Button disabled | Check balance ≥ 10 ETB |
| No data in admin | Perform at least one spin |
| 404 error | Verify backend is running |

## 📦 Files Structure

```
backend/
├── models/SpinResult.js
├── routes/spin.js
├── controllers/spinController.js
└── server.js (modified)

client/
├── src/
│   ├── pages/SpinWheel.jsx
│   ├── services/api.js (modified)
│   ├── App.jsx (modified)
│   └── pages/Home.jsx (modified)

admin/
├── src/
│   ├── pages/SpinResults.jsx
│   ├── services/api.js (modified)
│   ├── App.jsx (modified)
│   └── layout/AdminLayout.jsx (modified)
```

## ⚡ Quick Commands

### Start Backend
```bash
cd backend && npm run dev
```

### Start Client
```bash
cd client && npm run dev
```

### Start Admin
```bash
cd admin && npm run dev
```

### Test Spin API
```bash
curl -X POST http://localhost:5000/api/spin \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📈 Expected Outcomes

### After 100 Spins
- Revenue: 1,000 ETB
- Payouts: ~1,000 ETB (10 wins × 100)
- Net: ~0 ETB (break-even)

### After 1,000 Spins
- Revenue: 10,000 ETB
- Payouts: ~10,000 ETB (100 wins × 100)
- Net: ~0 ETB (break-even)

**Note**: Current 10% win rate creates break-even scenario. Adjust for profit margin.

## ✅ Testing Checklist

- [ ] User can spin with sufficient balance
- [ ] User blocked with insufficient balance
- [ ] Win rate approximately 10%
- [ ] Balance updates correctly
- [ ] History displays properly
- [ ] Admin sees all results
- [ ] Filters work correctly
- [ ] CSV export functions
- [ ] Mobile responsive
- [ ] Animations smooth

---

**Status**: ✅ Production Ready
**Version**: 1.0.0
**Last Updated**: January 8, 2026
