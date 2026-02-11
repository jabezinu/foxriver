# Wallet Sync Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         App.jsx                                 │
│                    (WalletProvider wrapper)                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    WalletContext.jsx                            │
│              (Provides useWallet() hook globally)               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   useWalletSync Hook                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ • updateWalletOptimistic()                               │  │
│  │ • setWalletExact()                                       │  │
│  │ • syncWallet()                                           │  │
│  │ • debouncedSync()                                        │  │
│  │ • executeWithOptimisticUpdate()                          │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Zustand Store                                 │
│              (userStore.js - wallet state)                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ wallet: { incomeWallet, personalWallet }                │  │
│  │ lastWalletFetch: timestamp                              │  │
│  │ fetchWallet(force)                                      │  │
│  │ invalidateCache()                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API Service                                  │
│              (services/api.js - axios)                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ • rankUpgradeAPI.createRequest()                         │  │
│  │ • withdrawalAPI.create()                                 │  │
│  │ • userAPI.getWallet()                                    │  │
│  │ • Other wallet-affecting endpoints                       │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend API                                  │
│              (Express/Node.js server)                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ • Process wallet transactions                            │  │
│  │ • Update database                                        │  │
│  │ • Return newWalletBalances                               │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

### Successful Transaction Flow

```
User Action (e.g., Rank Upgrade)
        │
        ▼
┌─────────────────────────────────────────┐
│ executeWithOptimisticUpdate() called    │
└─────────────────────────────────────────┘
        │
        ├─────────────────────────────────────────────────────┐
        │                                                     │
        ▼                                                     ▼
┌──────────────────────────┐                    ┌──────────────────────────┐
│ Optimistic Update        │                    │ API Call Sent            │
│ (Instant UI Update)      │                    │ (Network Request)        │
│                          │                    │                          │
│ wallet.personalWallet    │                    │ POST /rank-upgrades/...  │
│ -= 500                   │                    │                          │
└──────────────────────────┘                    └──────────────────────────┘
        │                                                     │
        │ (User sees change immediately)                     │
        │                                                     ▼
        │                                        ┌──────────────────────────┐
        │                                        │ Backend Processing       │
        │                                        │ • Validate transaction   │
        │                                        │ • Update database        │
        │                                        │ • Calculate new balance  │
        │                                        └──────────────────────────┘
        │                                                     │
        │                                                     ▼
        │                                        ┌──────────────────────────┐
        │                                        │ API Response             │
        │                                        │ {                        │
        │                                        │   success: true,         │
        │                                        │   newWalletBalances: {   │
        │                                        │     personalWallet: 500  │
        │                                        │   }                      │
        │                                        │ }                        │
        │                                        └──────────────────────────┘
        │                                                     │
        └─────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────────────┐
                    │ Update Store with        │
                    │ Exact Values             │
                    │                          │
                    │ wallet.personalWallet    │
                    │ = 500 (from API)         │
                    └──────────────────────────┘
                              │
                              ▼
                    ┌──────────────────────────┐
                    │ UI Re-renders            │
                    │ (Shows correct balance)  │
                    └──────────────────────────┘
```

### Error Recovery Flow

```
User Action
        │
        ▼
Optimistic Update Applied
        │
        ▼
API Call Fails ❌
        │
        ▼
┌─────────────────────────────────────┐
│ Automatic Sync Triggered            │
│ (Revert to server state)            │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│ Fetch Wallet from Server            │
│ GET /users/wallet                   │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│ Update Store with Correct Values    │
│ (Reverts optimistic update)         │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│ Show Error Toast to User            │
│ "Action failed"                     │
└─────────────────────────────────────┘
```

## Component Integration

### RankUpgrade.jsx Integration

```
RankUpgrade Component
        │
        ├─ useWallet() hook
        │  └─ wallet, executeWithOptimisticUpdate
        │
        ├─ handleConfirmUpgrade()
        │  │
        │  ├─ Calculate: netDeduction = price - refund
        │  │
        │  ├─ executeWithOptimisticUpdate(
        │  │  ├─ rankUpgradeAPI.createRequest()
        │  │  ├─ { personalWallet: -netDeduction }
        │  │  └─ { syncAfter: true, syncDelay: 1000 }
        │  │ )
        │  │
        │  ├─ updateUser() - Update membership level
        │  │
        │  └─ Navigate to /tier-list
        │
        └─ Display wallet.personalWallet in UI
```

### Withdraw.jsx Integration

```
Withdraw Component
        │
        ├─ useWallet() hook
        │  └─ wallet, executeWithOptimisticUpdate
        │
        ├─ handleWithdraw()
        │  │
        │  ├─ Calculate: deduction based on walletType
        │  │
        │  ├─ executeWithOptimisticUpdate(
        │  │  ├─ withdrawalAPI.create()
        │  │  ├─ { incomeWallet: -amount } or { personalWallet: -amount }
        │  │  └─ { syncAfter: true, syncDelay: 1500 }
        │  │ )
        │  │
        │  └─ Navigate to /transaction-status
        │
        └─ Display wallet.incomeWallet and wallet.personalWallet
```

## State Management Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    Zustand Store                             │
│                                                              │
│  wallet: {                                                   │
│    incomeWallet: 1000,                                       │
│    personalWallet: 500                                       │
│  }                                                           │
│                                                              │
│  lastWalletFetch: 1707123456789                              │
│  loading: { wallet: false }                                  │
└──────────────────────────────────────────────────────────────┘
        │
        ├─ setState() - Optimistic Update
        │  └─ wallet.personalWallet -= 500
        │
        ├─ setState() - Exact Update (from API)
        │  └─ wallet = { incomeWallet: 1000, personalWallet: 0 }
        │
        ├─ invalidateCache() - Mark stale
        │  └─ lastWalletFetch = 0
        │
        └─ fetchWallet(true) - Force refresh
           └─ GET /users/wallet
```

## Timing Diagram

```
Time    Action                          UI State              Server State
────────────────────────────────────────────────────────────────────────────
T0      User clicks "Upgrade"           Balance: 1000         Balance: 1000
        │
T1      Optimistic update applied       Balance: 500 ✓        Balance: 1000
        │ (Instant)                     (User sees change)
        │
T2      API request sent                Balance: 500          Processing...
        │
T3      Backend processing              Balance: 500          Processing...
        │
T4      API response received           Balance: 500          Balance: 500
        │ (with newWalletBalances)
        │
T5      Store updated with exact value  Balance: 500 ✓        Balance: 500
        │ (Confirmed)                   (Correct value)
        │
T6      Debounced sync triggered        Balance: 500          Balance: 500
        │ (After 1 second)              (Verified)
        │
T7      Sync complete                   Balance: 500 ✓        Balance: 500
        │                               (Consistent)
```

## Cache Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    Wallet Cache                             │
│                                                             │
│  Fresh (< 5 min)                                            │
│  ├─ Use cached value                                        │
│  └─ No API call                                             │
│                                                             │
│  Stale (> 5 min)                                            │
│  ├─ Fetch from server                                       │
│  └─ Update cache                                            │
│                                                             │
│  Force Refresh                                              │
│  ├─ Always fetch from server                                │
│  └─ Update cache                                            │
│                                                             │
│  Invalidate                                                 │
│  ├─ Mark as stale                                           │
│  └─ Next access triggers fetch                              │
└─────────────────────────────────────────────────────────────┘
```

## Error Handling Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                  Error Handling Flow                        │
│                                                             │
│  1. Optimistic Update Applied                              │
│     └─ UI shows new balance                                │
│                                                             │
│  2. API Call Fails                                          │
│     └─ Catch error                                          │
│                                                             │
│  3. Automatic Sync Triggered                               │
│     └─ Fetch wallet from server                            │
│                                                             │
│  4. Revert to Server State                                 │
│     └─ UI shows correct balance                            │
│                                                             │
│  5. Show Error Toast                                        │
│     └─ User informed of failure                            │
│                                                             │
│  Result: Consistent state, good UX                         │
└─────────────────────────────────────────────────────────────┘
```

## Performance Optimization

```
┌─────────────────────────────────────────────────────────────┐
│              Debounced Sync Strategy                        │
│                                                             │
│  Multiple Updates:                                          │
│  ├─ Update 1: Start 1s timer                               │
│  ├─ Update 2: Reset 1s timer                               │
│  ├─ Update 3: Reset 1s timer                               │
│  └─ After 1s idle: Single sync call                        │
│                                                             │
│  Result: 3 updates = 1 API call (vs 3 calls)               │
│  Benefit: 66% reduction in network traffic                 │
└─────────────────────────────────────────────────────────────┘
```

## Key Design Principles

1. **Optimistic Updates**: Instant UI feedback
2. **Automatic Sync**: Data consistency
3. **Error Recovery**: Graceful degradation
4. **Debouncing**: Network efficiency
5. **Caching**: Reduced API calls
6. **Type Safety**: Zustand + React hooks
7. **Separation of Concerns**: Hook, Context, Store
8. **Reusability**: Works across all components

## Technology Stack

- **State Management**: Zustand (lightweight, performant)
- **Context API**: React Context (global access)
- **HTTP Client**: Axios (with interceptors)
- **UI Feedback**: React Hot Toast (notifications)
- **Routing**: React Router (navigation)

## Scalability

The architecture scales well because:

1. **Zustand**: Minimal re-renders, efficient updates
2. **Debouncing**: Prevents API call storms
3. **Caching**: Reduces server load
4. **Optimistic Updates**: Better perceived performance
5. **Error Handling**: Prevents cascading failures

## Future Enhancements

1. **WebSocket Integration**: Real-time updates
2. **Offline Support**: Service workers
3. **Transaction Queue**: Offline transaction batching
4. **Analytics**: Performance monitoring
5. **Notifications**: Push notifications for wallet changes
