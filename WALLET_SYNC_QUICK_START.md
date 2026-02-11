# Wallet Sync Quick Start Guide

## For Developers: How to Add Instant Wallet Updates to Any Page

### 1. Import the Hook
```javascript
import { useWallet } from '../contexts/WalletContext';
```

### 2. Get the Wallet Sync Methods
```javascript
const { wallet, executeWithOptimisticUpdate } = useWallet();
```

### 3. Use in Your Action Handler
```javascript
const handleAction = async () => {
  try {
    // Calculate what will change in the wallet
    const walletChange = {
      incomeWallet: -100,      // Negative = deduction, Positive = addition
      personalWallet: 50       // Can update both or just one
    };

    // Execute action with optimistic update
    await executeWithOptimisticUpdate(
      () => yourAPI.doSomething(data),  // Your API call
      walletChange,                      // Optimistic update
      { syncAfter: true, syncDelay: 1000 } // Options
    );

    toast.success('Action completed!');
  } catch (error) {
    toast.error('Action failed');
  }
};
```

### 4. Display Wallet in UI
```javascript
<p>Income Wallet: {formatNumber(wallet.incomeWallet)} ETB</p>
<p>Personal Wallet: {formatNumber(wallet.personalWallet)} ETB</p>
```

## Common Patterns

### Pattern 1: Simple Deduction
```javascript
// User spends 500 from personal wallet
await executeWithOptimisticUpdate(
  () => api.spend(500),
  { personalWallet: -500 }
);
```

### Pattern 2: Transfer Between Wallets
```javascript
// Transfer 1000 from income to personal
await executeWithOptimisticUpdate(
  () => api.transfer(1000),
  { incomeWallet: -1000, personalWallet: 1000 }
);
```

### Pattern 3: Refund + Deduction
```javascript
// Upgrade with refund: pay 1000, get 500 back
const refund = 500;
const cost = 1000;
const net = cost - refund;

await executeWithOptimisticUpdate(
  () => api.upgrade(cost),
  { personalWallet: -net }
);
```

### Pattern 4: Multiple Wallets Affected
```javascript
// Complex transaction affecting both wallets
await executeWithOptimisticUpdate(
  () => api.complexAction(data),
  { 
    incomeWallet: -300,
    personalWallet: 200
  }
);
```

## Real Examples from Implementation

### Example 1: Rank Upgrade (RankUpgrade.jsx)
```javascript
const currentTier = tiers.find(t => t.level === user?.membershipLevel);
const refundAmount = currentTier && currentTier.level !== 'Intern' ? currentTier.price : 0;
const netDeduction = selectedTier.price - refundAmount;

await executeWithOptimisticUpdate(
  () => rankUpgradeAPI.createRequest({
    newLevel: selectedTier.level,
    amount: selectedTier.price,
    walletType: 'personal'
  }),
  { personalWallet: -netDeduction },
  { syncAfter: true, syncDelay: 1000 }
);
```

### Example 2: Withdrawal (Withdraw.jsx)
```javascript
const deduction = walletType === 'income' 
  ? { incomeWallet: -selectedAmount }
  : { personalWallet: -selectedAmount };

await executeWithOptimisticUpdate(
  () => withdrawalAPI.create({
    amount: selectedAmount,
    walletType
  }),
  deduction,
  { syncAfter: true, syncDelay: 1500 }
);
```

## Pages to Update

These pages should be updated with wallet sync:

1. **Deposit.jsx** - When user deposits money
2. **SpinWheel.jsx** - When user spins and wins/loses
3. **Task.jsx** - When user completes tasks
4. **MyInvestments.jsx** - When user invests
5. **Wealth.jsx** - When user manages wealth
6. **Mine.jsx** - When user claims earnings

## Sync Delay Recommendations

| Operation Type | Delay | Reason |
|---|---|---|
| Quick operations | 500ms | Fast API response |
| Normal operations | 1000ms | Standard API response |
| Slow operations | 1500ms | Slow API or complex calculation |
| Very slow operations | 2000ms | Multiple backend operations |

## Testing Your Implementation

### Manual Testing
1. Open DevTools Network tab
2. Perform action
3. Watch wallet update instantly
4. Watch API call in network tab
5. Verify wallet syncs after delay

### Automated Testing
```javascript
// Test optimistic update
const { wallet, updateWalletOptimistic } = useWallet();
updateWalletOptimistic({ personalWallet: -100 });
expect(wallet.personalWallet).toBe(originalBalance - 100);

// Test sync
await syncWallet();
// Verify wallet matches server state
```

## Troubleshooting

### Wallet Not Updating
- [ ] Is `useWallet()` called inside a component wrapped by `WalletProvider`?
- [ ] Is the import correct: `import { useWallet } from '../contexts/WalletContext'`?
- [ ] Check browser console for errors

### Sync Not Happening
- [ ] Is `syncAfter: true` in options?
- [ ] Check Network tab - is API call being made?
- [ ] Is sync delay too long?

### Wrong Balance After Sync
- [ ] Verify optimistic update calculation is correct
- [ ] Check if API returns `newWalletBalances`
- [ ] Verify no race conditions with multiple updates

## API Response Format

The system expects API responses to include wallet data:

```javascript
{
  success: true,
  message: "Action completed",
  newWalletBalances: {
    incomeWallet: 1000,
    personalWallet: 500
  }
}
```

If your API doesn't return `newWalletBalances`, the system will automatically sync with the server.

## Advanced: Manual Sync

If you need to manually sync without an action:

```javascript
const { syncWallet } = useWallet();

// Force immediate sync
await syncWallet();

// Or debounced sync
const { debouncedSync } = useWallet();
debouncedSync(2000); // Sync after 2 seconds
```

## Performance Tips

1. **Use debounced sync** for multiple rapid updates
2. **Calculate accurate optimistic updates** to minimize sync corrections
3. **Avoid unnecessary syncs** - let the system handle it
4. **Use appropriate sync delays** based on operation complexity
5. **Test on slow networks** to ensure good UX

## Summary

The wallet sync system is designed to be:
- **Simple**: Just call `executeWithOptimisticUpdate`
- **Fast**: Instant UI updates with optimistic changes
- **Reliable**: Automatic sync ensures data consistency
- **Robust**: Error handling reverts changes automatically
- **Performant**: Debouncing and caching minimize API calls

Just follow the pattern and your wallet will update instantly!
