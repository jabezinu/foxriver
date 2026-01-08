# Spin the Wheel Feature Documentation

## Overview
The Spin the Wheel feature allows users to pay 10 ETB per spin for a chance to win 100 ETB. The wheel contains 10 segments: 9 "Try Again" segments and 1 winning segment that awards 100 ETB.

## Feature Components

### 1. Backend Implementation

#### Database Model (`backend/models/SpinResult.js`)
- Tracks all spin results with user information
- Records: userId, result, amounts paid/won, balance before/after
- Indexed for efficient querying

#### API Routes (`backend/routes/spin.js`)
- `POST /api/spin` - Spin the wheel (requires authentication)
- `GET /api/spin/history` - Get user's spin history
- `GET /api/spin/admin/all` - Get all spin results (admin only)

#### Controller (`backend/controllers/spinController.js`)
- **spinWheel**: Handles spin logic with 10% win probability
- **getUserSpinHistory**: Returns paginated user history with stats
- **getAllSpinResults**: Admin endpoint with filtering and statistics

### 2. Client Implementation

#### Spin Wheel Page (`client/src/pages/SpinWheel.jsx`)
Features:
- Animated spinning wheel with 10 color-coded segments
- Real-time balance display
- Spin button (10 ETB per spin)
- Result modal with win/loss notification
- Personal statistics dashboard
- Recent spin history

Visual Elements:
- Gradient background (purple to indigo)
- Smooth 4-second spin animation
- Pointer indicator at top
- Color-coded segments for visual appeal
- Responsive design for all screen sizes

#### Navigation
- Added to Home page menu grid
- Accessible via `/spin` route

### 3. Admin Panel Implementation

#### Spin Results Page (`admin/src/pages/SpinResults.jsx`)
Features:
- Comprehensive statistics dashboard:
  - Total spins
  - Total wins with win rate percentage
  - Total collected (revenue)
  - Total paid out (winnings)
  - Net profit calculation
- Advanced filtering:
  - Filter by result type (Win/Try Again)
  - Date range filtering
  - Clear filters option
- Paginated results table showing:
  - Date and time
  - User phone number
  - Membership level
  - Result
  - Amount paid/won
  - Balance before/after
- CSV export functionality
- Real-time refresh

#### Navigation
- Added to admin sidebar menu
- Accessible via `/spin-results` route

## Technical Details

### Probability System
- 10% chance to win (1 in 10 spins)
- Implemented using `Math.random() < 0.1`
- Fair and transparent algorithm

### Payment Flow
1. User clicks spin button
2. System checks balance (minimum 10 ETB required)
3. Deducts 10 ETB from personalWallet
4. Determines result (10% win probability)
5. If win: adds 100 ETB to personalWallet
6. Records transaction in database
7. Returns result to frontend

### Security Features
- Authentication required for all user endpoints
- Admin-only access for viewing all results
- Balance validation before spin
- Transaction atomicity (balance updates and record creation)
- Proper error handling

### Database Schema
```javascript
{
  userId: ObjectId (ref: User),
  result: String (enum: ['Try Again', 'Win 100 ETB']),
  amountPaid: Number (default: 10),
  amountWon: Number (default: 0),
  balanceBefore: Number,
  balanceAfter: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### User Endpoints

#### Spin the Wheel
```
POST /api/spin
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "result": "Win 100 ETB" | "Try Again",
    "amountWon": 100 | 0,
    "balanceBefore": 150.00,
    "balanceAfter": 240.00,
    "spinResult": { ... }
  }
}
```

#### Get Spin History
```
GET /api/spin/history?page=1&limit=20
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "spins": [...],
    "pagination": { page, limit, total, pages },
    "stats": {
      "totalSpins": 50,
      "totalPaid": 500,
      "totalWon": 300,
      "wins": 3
    }
  }
}
```

### Admin Endpoints

#### Get All Spin Results
```
GET /api/spin/admin/all?page=1&limit=50&result=Win 100 ETB&startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <admin_token>

Response:
{
  "success": true,
  "data": {
    "spins": [...],
    "pagination": { page, limit, total, pages },
    "stats": {
      "totalSpins": 1000,
      "totalPaid": 10000,
      "totalWon": 9000,
      "wins": 90
    }
  }
}
```

## Usage Instructions

### For Users
1. Navigate to Home page
2. Click on "Spin" in the menu grid
3. Ensure you have at least 10 ETB in your personal wallet
4. Click "SPIN (10 ETB)" button
5. Watch the wheel spin for 4 seconds
6. See your result and updated balance
7. View your spin history and statistics

### For Admins
1. Log into admin panel
2. Click "Spin Results" in sidebar
3. View overall statistics
4. Use filters to analyze specific periods or results
5. Export data to CSV for further analysis
6. Monitor win rates and profitability

## Files Modified/Created

### Backend
- ✅ `backend/models/SpinResult.js` (new)
- ✅ `backend/routes/spin.js` (new)
- ✅ `backend/controllers/spinController.js` (new)
- ✅ `backend/server.js` (modified - added spin route)

### Client
- ✅ `client/src/pages/SpinWheel.jsx` (new)
- ✅ `client/src/services/api.js` (modified - added spin API)
- ✅ `client/src/App.jsx` (modified - added spin route)
- ✅ `client/src/pages/Home.jsx` (modified - updated spin menu item)

### Admin
- ✅ `admin/src/pages/SpinResults.jsx` (new)
- ✅ `admin/src/services/api.js` (modified - added admin spin API)
- ✅ `admin/src/App.jsx` (modified - added spin results route)
- ✅ `admin/src/layout/AdminLayout.jsx` (modified - added navigation item)

## Testing Checklist

- [ ] User can spin the wheel with sufficient balance
- [ ] User cannot spin with insufficient balance
- [ ] Win probability is approximately 10%
- [ ] Balance updates correctly on win/loss
- [ ] Spin history displays correctly
- [ ] Statistics calculate accurately
- [ ] Admin can view all spin results
- [ ] Admin filters work correctly
- [ ] CSV export includes all data
- [ ] Animations work smoothly
- [ ] Responsive design works on mobile

## Future Enhancements (Optional)
- Add sound effects for spinning and winning
- Implement daily spin limits
- Add special events with increased win rates
- Create leaderboards for biggest winners
- Add push notifications for wins
- Implement spin streaks and bonuses
