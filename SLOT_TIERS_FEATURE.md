# 🎰 Slot Machine Tiers Feature

## Overview
Admins can now create multiple betting tiers with different bet amounts, win amounts, and win probabilities. Users select a tier before playing.

## Features

### Admin Capabilities
- **Create Tiers**: Set bet amount, win amount, and win probability
- **Edit Tiers**: Update existing tier settings
- **Delete Tiers**: Remove tiers
- **Toggle Status**: Activate/deactivate tiers
- **Order Tiers**: Set display order

### Tier Properties
- **Name**: Tier name (e.g., "Bronze", "Silver", "Gold")
- **Bet Amount**: How much users pay to play (ETB)
- **Win Amount**: How much users win on jackpot (ETB)
- **Win Probability**: Chance of winning (0-100%)
- **Description**: Optional description
- **Order**: Display order (lower numbers first)
- **Status**: Active/Inactive

### User Experience
1. Click "PLAY NOW" button
2. **Select Tier**: Choose from available tiers showing:
   - Tier name
   - Bet amount
   - Win amount
   - Win probability
   - Multiplier (win/bet ratio)
3. **Select Wallet**: Choose Personal or Income balance
4. Play the slot machine
5. Winnings always go to Income Balance

## Examples

### Example Tiers

**Bronze Tier**
- Bet: 10 ETB
- Win: 1000 ETB
- Probability: 10%
- Multiplier: 100x

**Silver Tier**
- Bet: 50 ETB
- Win: 5000 ETB
- Probability: 8%
- Multiplier: 100x

**Gold Tier**
- Bet: 100 ETB
- Win: 15000 ETB
- Probability: 5%
- Multiplier: 150x

**Diamond Tier**
- Bet: 500 ETB
- Win: 100000 ETB
- Probability: 2%
- Multiplier: 200x

## Technical Implementation

### Database Model (`backend/models/SlotTier.js`)
```javascript
{
  name: String,
  betAmount: Number,
  winAmount: Number,
  winProbability: Number (0-100),
  isActive: Boolean,
  description: String,
  order: Number
}
```

### API Endpoints

#### Public (Users)
- `GET /api/slot-tiers` - Get all active tiers

#### Admin Only
- `GET /api/slot-tiers/admin/all` - Get all tiers
- `POST /api/slot-tiers/admin` - Create new tier
- `PUT /api/slot-tiers/admin/:id` - Update tier
- `DELETE /api/slot-tiers/admin/:id` - Delete tier
- `PATCH /api/slot-tiers/admin/:id/toggle` - Toggle active status

### Updated Spin Logic
```javascript
// User selects tier and wallet
const tier = await SlotTier.findById(tierId);
const spinCost = tier.betAmount;
const winAmount = tier.winAmount;
const winProbability = tier.winProbability / 100;

// Deduct from selected wallet
user[wallet] -= spinCost;

// Determine win based on tier probability
const isWin = Math.random() < winProbability;

// Add winnings to income wallet
if (isWin) {
  user.incomeWallet += winAmount;
}
```

### SpinResult Updates
Now includes:
- `tierId`: Reference to SlotTier
- `tierName`: Name of tier used

## Admin Panel

### Slot Tiers Page (`/slot-tiers`)
- Grid view of all tiers
- Color-coded active/inactive status
- Quick toggle for activation
- Edit and delete buttons
- Create new tier button

### Tier Card Display
- Tier name and status badge
- Bet amount (red)
- Win amount (green)
- Win probability (blue)
- Multiplier (purple)
- Description (if provided)
- Edit and Delete buttons
- Toggle switch for active/inactive

### Create/Edit Modal
Form fields:
- Tier Name (required)
- Bet Amount (required, min: 1)
- Win Amount (required, min: 1)
- Win Probability (required, 0-100%)
- Description (optional)
- Display Order (default: 0)

## User Interface

### Tier Selection Modal
- Grid layout (2 columns on desktop)
- Each tier shows:
  - Name and win probability badge
  - Bet amount
  - Win amount
  - Multiplier
  - Description (if any)
- Disabled if insufficient balance
- Cancel button

### Wallet Selection Modal
- Shows selected tier info at top
- Personal Balance option
- Income Balance option
- Disabled if insufficient balance for selected tier
- Cancel button

## Files Created/Modified

### Backend
- ✅ `backend/models/SlotTier.js` (new)
- ✅ `backend/controllers/slotTierController.js` (new)
- ✅ `backend/routes/slotTier.js` (new)
- ✅ `backend/controllers/spinController.js` (modified - tier support)
- ✅ `backend/models/SpinResult.js` (modified - added tierId, tierName)
- ✅ `backend/server.js` (modified - added slot-tiers route)

### Admin Panel
- ✅ `admin/src/pages/SlotTiers.jsx` (new)
- ✅ `admin/src/App.jsx` (modified - added route)
- ✅ `admin/src/layout/AdminLayout.jsx` (modified - added menu item)

### Client
- ✅ `client/src/pages/SpinWheel.jsx` (modified - tier selection)

## Benefits

1. **Flexibility**: Admins control all betting options
2. **Variety**: Multiple tiers for different risk levels
3. **Scalability**: Easy to add new tiers
4. **Control**: Can activate/deactivate tiers anytime
5. **Transparency**: Users see exact odds and payouts
6. **Customization**: Each tier can have unique settings

## Usage

### For Admins
1. Go to Admin Panel → Slot Tiers
2. Click "Create New Tier"
3. Fill in tier details
4. Save
5. Toggle active status as needed

### For Users
1. Go to Slot Machine page
2. Click "PLAY NOW"
3. Select desired tier
4. Choose wallet (Personal or Income)
5. Play and win!

---

**Status**: ✅ Complete and Ready
**Date**: January 8, 2026
