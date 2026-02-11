# Instant Wallet Update Implementation Guide

## Overview
This implementation provides professional, real-time wallet updates across the client-side application. When users perform wallet-affecting actions (rank upgrade, withdrawal, deposits, etc.), the wallet balance updates instantly with optimistic updates and automatic synchronization with the backend.

## Architecture

### Core Components

#### 1. **useWalletSync Hook** (`client/src/hooks/useWalletSync.js`)
Custom React hook that manages wallet state synchronization with the following capabilities:

- **Optimistic Updates**: Instantly update wallet UI before API response
- **Automatic Sync**: Debounced synchronization with backend
- **Error Recovery**: Automatic revert on API failures
- **Flexible Configuration**: Customizable sync delays and strategies

**Key Methods:**
```javascript
// Update wallet instantly (optimistic)
updateWalletOptimistic({ incomeWallet: -100, personalWallet: 50 })

// Set exact wallet values (after API response)
setWalletExact({ incomeWallet: 1000, personalWallet: 500 })

// Sync with backend
await syncWallet()

// Debounced sync (useful for rapid updates)
debouncedSync(2000) // Sync after 2 seconds

// Execute action with optimistic update
await executeWithOptimisticUpdate(
  apiCall,
  optimisticUpdate,
  { syncAfter: true, syncDelay: 1000 }
)
```

#### 2. **WalletContext** (`client/src/contexts/WalletContext.jsx`)
React Context that provides wallet sync functionality globally:

- Wraps the entire app to make wallet sync available everywhere
- Provides `useWallet()` hook for accessing wallet sync methods
- Ensures consistent wallet state across all components

#### 3. **Updated Store** (`client/src/store/userStore.js`)
Zustand store with enhanced wallet management:

- Caches wallet data with 5-minute TTL
- Supports forced refresh
- Provides cache invalidation
- Integrates with optimistic updates

## Implementation Pattern

### Basic Usage in Components

```javascript
import { useWallet } from '../contexts/WalletContext';

function MyComponent() {
  const { wallet, executeWithOptimisticUpdate } = useWallet();

  const handleAction = async () => {
    try {
      // Execute action with optimistic update
      await executeWithOptimisticUpdate(
        () => apiCall(data),
        { personalWallet: -100 }, // Optimistic deduction
        { syncAfter: true, syncDelay: 1000 }
      );
      
      toast.success('Action completed!');
    } catch (error) {
      toast.error('Action failed');
    }
  };

  return (
    <div>
      <p>Balance: {wallet.personalWallet}</p>
      <button onClick={handleAction}>Perform Action</button>
    </div>
  );
}
```

## Updated Pages

### 1. **RankUpgrade.jsx**
- Imports `useWallet` hook
- Uses `executeWithOptimisticUpdate` for rank upgrades
- Calculates refund amount and net deduction
- Wallet updates instantly when user confirms upgrade
- Automatic sync after 1 second

**Key Changes:**
```javascript
const { wallet, executeWithOptimisticUpdate } = useWallet();

// Calculate net deduction (price - refund)
const netDeduction = selectedTier.price - refundAmount;

// Execute with optimistic update
await executeWithOptimisticUpdate(
  () => rankUpgradeAPI.createRequest({...}),
  { personalWallet: -netDeduction },
  { syncAfter: true, syncDelay: 1000 }
);
```

### 2. **Withdraw.jsx**
- Imports `useWallet` hook
- Uses `executeWithOptimisticUpdate` for withdrawals
- Deducts from selected wallet (income or personal)
- Wallet updates instantly on submission
- Automatic sync after 1.5 seconds
- Navigates to transaction status instead of full reload

**Key Changes:**
```javascript
const { executeWithOptimisticUpdate } = useWallet();

const deduction = walletType === 'income' 
  ? { incomeWallet: -selectedAmount }
  : { personalWallet: -selectedAmount };

await executeWithOptimisticUpdate(
  () => withdrawalAPI.create({...}),
  deduction,
  { syncAfter: true, syncDelay: 1500 }
);
```

## Integration Steps

### Step 1: Wrap App with WalletProvider
Already done in `App.jsx`:
```javascript
<SettingsProvider>
  <WalletProvider>
    <BrowserRouter>
      {/* Routes */}
    </BrowserRouter>
  </WalletProvider>
</SettingsProvider>
```

### Step 2: Use in Components
Import and use the `useWallet` hook:
```javascript
import { useWallet } from '../contexts/WalletContext';

const { wallet, executeWithOptimisticUpdate } = useWallet();
```

### Step 3: Apply to Other Wallet-Affecting Actions
Apply the same pattern to other pages that affect wallet:
- Deposit page
- Spin wheel
- Task completion
- Investment actions
- Any other wallet-affecting operations

## Configuration Options

### executeWithOptimisticUpdate Options
```javascript
{
  syncAfter: true,      // Whether to sync after action (default: true)
  syncDelay: 1000       // Delay before syncing in ms (default: 1000)
}
```

### Sync Delay Recommendations
- **Fast operations** (< 500ms): `syncDelay: 500`
- **Normal operations** (500ms - 2s): `syncDelay: 1000`
- **Slow operations** (> 2s): `syncDelay: 1500-2000`

## Error Handling

The system automatically handles errors:

1. **Optimistic Update Applied**: Wallet updates instantly
2. **API Call Fails**: Automatic sync triggered to revert to correct state
3. **User Notified**: Toast message shows success or error
4. **State Consistent**: Wallet always reflects server state after sync

```javascript
try {
  await executeWithOptimisticUpdate(apiCall, update);
  toast.success('Success!');
} catch (error) {
  // Automatic sync reverts optimistic update
  toast.error('Failed');
}
```

## Performance Considerations

### Debounced Sync
Multiple rapid updates are batched:
```javascript
// Multiple updates within 1 second = single sync
updateWalletOptimistic({ incomeWallet: -50 });
updateWalletOptimistic({ incomeWallet: -50 });
updateWalletOptimistic({ incomeWallet: -50 });
// Only one sync request after 1 second
```

### Cache Strategy
- Wallet data cached for 5 minutes
- Force refresh available when needed
- Automatic invalidation on errors

### Network Optimization
- Selective cache busting for wallet endpoints
- Minimal API calls with debouncing
- Efficient state updates using Zustand

## Best Practices

### 1. Always Use executeWithOptimisticUpdate
```javascript
// ✅ Good - Uses optimistic update
await executeWithOptimisticUpdate(apiCall, update);

// ❌ Avoid - Direct API call without optimization
await apiCall();
```

### 2. Calculate Accurate Optimistic Updates
```javascript
// ✅ Good - Accurate calculation
const netDeduction = price - refund;
updateWalletOptimistic({ personalWallet: -netDeduction });

// ❌ Avoid - Inaccurate calculation
updateWalletOptimistic({ personalWallet: -price });
```

### 3. Provide User Feedback
```javascript
// ✅ Good - Clear feedback
toast.success('Rank upgraded successfully!');
toast.error('Insufficient balance');

// ❌ Avoid - Silent failures
// No feedback to user
```

### 4. Handle Navigation Properly
```javascript
// ✅ Good - Delayed navigation
setTimeout(() => navigate('/next-page'), 500);

// ❌ Avoid - Immediate navigation
navigate('/next-page');
```

## Testing Checklist

- [ ] Wallet updates instantly on action
- [ ] Wallet syncs with backend after delay
- [ ] Error handling reverts optimistic update
- [ ] Multiple rapid actions are debounced
- [ ] Wallet displays correct balance after page reload
- [ ] Insufficient balance prevents action
- [ ] Toast notifications show correctly
- [ ] Navigation works after action
- [ ] Works on slow networks (test with throttling)
- [ ] Works offline (graceful degradation)

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live wallet updates
2. **Transaction History**: Instant transaction history updates
3. **Notifications**: Push notifications for wallet changes
4. **Analytics**: Track wallet update performance metrics
5. **Offline Support**: Service worker for offline wallet updates

## Troubleshooting

### Wallet Not Updating
1. Check if `WalletProvider` wraps the component
2. Verify `useWallet()` is called within provider
3. Check browser console for errors
4. Verify API response includes `newWalletBalances`

### Sync Not Happening
1. Check network tab for API calls
2. Verify `syncAfter: true` in options
3. Check if sync delay is too long
4. Verify wallet endpoint is not cached

### Incorrect Balance After Sync
1. Verify optimistic update calculation
2. Check API response for correct values
3. Verify no race conditions with multiple updates
4. Check server-side wallet calculation

## Files Modified

- `client/src/App.jsx` - Added WalletProvider wrapper
- `client/src/pages/RankUpgrade.jsx` - Integrated wallet sync
- `client/src/pages/Withdraw.jsx` - Integrated wallet sync

## Files Created

- `client/src/hooks/useWalletSync.js` - Core wallet sync hook
- `client/src/contexts/WalletContext.jsx` - Wallet context provider

## Summary

This implementation provides a professional, production-ready solution for instant wallet updates. It combines optimistic updates for immediate UI feedback with automatic backend synchronization for data consistency. The system is robust, handles errors gracefully, and provides excellent user experience with minimal network overhead.
