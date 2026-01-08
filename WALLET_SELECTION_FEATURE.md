# 💰 Wallet Selection Feature

## Overview
Users can now choose between **Personal Balance** or **Income Balance** when playing the slot machine game.

## How It Works

### User Flow
1. User clicks "PLAY (10 ETB)" button
2. Modal appears showing both wallet options
3. User selects which wallet to use
4. Game deducts 10 ETB from selected wallet
5. If win, 100 ETB is added to the same wallet

### Modal Design
- **Personal Balance** (💰)
  - Yellow/orange gradient button
  - Shows current personal balance
  - Disabled if balance < 10 ETB

- **Income Balance** (💵)
  - Green gradient button
  - Shows current income balance
  - Disabled if balance < 10 ETB

- **Cancel Button**
  - Gray button at bottom
  - Closes modal without playing

### Balance Display
The main page now shows both balances side by side:
- Left card: 💰 Personal Balance (yellow)
- Right card: 💵 Income Balance (green)

## Technical Implementation

### Frontend Changes (`client/src/pages/SpinWheel.jsx`)
```javascript
// State management
const [personalBalance, setPersonalBalance] = useState(0);
const [incomeBalance, setIncomeBalance] = useState(0);
const [showWalletModal, setShowWalletModal] = useState(false);
const [selectedWallet, setSelectedWallet] = useState(null);

// Wallet selection handler
const handleWalletSelect = (wallet) => {
  const balance = wallet === 'personal' ? personalBalance : incomeBalance;
  
  if (balance < 10) {
    toast.error(`Insufficient ${wallet} balance!`);
    return;
  }
  
  setSelectedWallet(wallet);
  setShowWalletModal(false);
  handleSpin(wallet);
};
```

### Backend Changes (`backend/controllers/spinController.js`)
```javascript
// Accept wallet type from request
const { walletType } = req.body; // 'personal' or 'income'

// Determine which wallet to use
const wallet = walletType === 'income' ? 'incomeWallet' : 'personalWallet';

// Deduct from and add to the selected wallet
user[wallet] -= spinCost;
if (isWin) {
  user[wallet] += amountWon;
}
```

### Database Changes (`backend/models/SpinResult.js`)
```javascript
walletType: {
  type: String,
  enum: ['personal', 'income'],
  default: 'personal'
}
```

## Benefits
1. **Flexibility**: Users can choose which balance to use
2. **Transparency**: Clear display of both balances
3. **User Control**: Easy to manage different wallet types
4. **Better UX**: Visual feedback on available balances

## Validation
- Modal only shows if at least one wallet has ≥ 10 ETB
- Individual wallet buttons disabled if insufficient balance
- Clear error messages for insufficient funds
- Balance updates immediately after play

---

**Status**: ✅ Complete and Tested
**Implementation Date**: January 8, 2026
