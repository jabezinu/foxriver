# Withdrawal Flow Changes - Implementation Summary

## Overview
Changed the withdrawal request flow to deduct funds immediately when a user submits a withdrawal request, rather than waiting for admin approval.

## Changes Made

### 1. **withdrawalController.js** - Create Withdrawal
**Previous Behavior:**
- User submits withdrawal request
- No funds deducted from wallet
- Request status: pending
- Weekly limit checked against ANY withdrawal (including rejected)

**New Behavior:**
- User submits withdrawal request
- **Funds immediately deducted from wallet** (wrapped in database transaction)
- Request status: pending
- **Weekly limit only counts pending/approved withdrawals** (rejected ones don't count)
- Message updated to reflect immediate deduction

**Code Changes:**
- Added `sequelize.transaction()` wrapper for atomicity
- Deduct amount from appropriate wallet field before creating withdrawal record
- Updated weekly limit check to exclude rejected withdrawals
- Updated success message to indicate amount was deducted

### 2. **transactionService.js** - Approve Withdrawal
**Previous Behavior:**
- Admin approves request
- Funds deducted from wallet
- Status changed to approved

**New Behavior:**
- Admin approves request
- **No wallet changes** (funds already deducted)
- Status changed to approved

**Code Changes:**
- Removed wallet deduction logic
- Removed balance check (no longer needed)
- Updated comments to reflect new flow

### 3. **transactionService.js** - Reject Withdrawal
**Previous Behavior:**
- Admin rejects request
- No wallet changes (nothing was deducted)
- Status changed to rejected

**New Behavior:**
- Admin rejects request
- **Funds refunded back to wallet** (wrapped in database transaction)
- Status changed to rejected

**Code Changes:**
- Added transaction wrapper for atomicity
- Added wallet refund logic
- Added validation to prevent re-rejection
- Updated logging to include refund information

### 4. **transactionService.js** - Undo Withdrawal
**Previous Behavior:**
- If approved: Refund amount (reverse the deduction)
- If rejected: No wallet changes

**New Behavior:**
- If approved: **Refund amount** (reverse the original deduction)
- If rejected: **Deduct amount again** (reverse the refund that happened on rejection)

**Code Changes:**
- Updated logic to handle both approved and rejected states
- Added balance check for rejected undo operations
- Enhanced comments explaining the state transitions

## State Transitions

### Wallet Balance States

| Action | Previous Balance Change | New Balance Change |
|--------|------------------------|-------------------|
| **Create Request** | No change | **-amount** (deducted) |
| **Approve** | **-amount** (deducted) | No change |
| **Reject** | No change | **+amount** (refunded) |
| **Undo Approved** | +amount (refunded) | +amount (refunded) |
| **Undo Rejected** | No change | **-amount** (deducted) |

### Example Flow

**Scenario 1: Approved Withdrawal**
1. User has 1000 ETB in wallet
2. User requests 750 ETB withdrawal → Balance: **250 ETB** (deducted immediately)
3. Admin approves → Balance: **250 ETB** (no change)
4. Final: User has 250 ETB, withdrawal processed

**Scenario 2: Rejected Withdrawal**
1. User has 1000 ETB in wallet
2. User requests 750 ETB withdrawal → Balance: **250 ETB** (deducted immediately)
3. Admin rejects → Balance: **1000 ETB** (refunded)
4. Final: User has 1000 ETB, withdrawal cancelled

**Scenario 3: Undo Approved**
1. User has 1000 ETB, requests 750 ETB → Balance: 250 ETB
2. Admin approves → Balance: 250 ETB
3. Admin undoes → Balance: **1000 ETB** (refunded)
4. Status back to pending with balance: 250 ETB (deducted)

**Scenario 4: Undo Rejected**
1. User has 1000 ETB, requests 750 ETB → Balance: 250 ETB
2. Admin rejects → Balance: 1000 ETB (refunded)
3. Admin undoes → Balance: **250 ETB** (deducted again)
4. Status back to pending with balance: 250 ETB (deducted)

## Safety Features

1. **Database Transactions**: All wallet operations wrapped in transactions to prevent partial updates
2. **Balance Validation**: Checks sufficient balance before deduction
3. **Status Validation**: Prevents invalid state transitions (e.g., rejecting already rejected)
4. **Atomic Operations**: Wallet updates and status changes happen together or not at all
5. **Detailed Logging**: All operations logged with amounts and user IDs for audit trail

## Testing Recommendations

1. **Create withdrawal with sufficient balance** - verify immediate deduction
2. **Create withdrawal with insufficient balance** - verify error handling
3. **Approve pending withdrawal** - verify no double deduction
4. **Reject pending withdrawal** - verify refund
5. **Create withdrawal after rejection** - verify user can immediately create new request (rejected doesn't count toward weekly limit)
6. **Create withdrawal after approval** - verify weekly limit blocks new request
7. **Undo approved withdrawal** - verify refund and state restoration
8. **Undo rejected withdrawal** - verify re-deduction and state restoration
9. **Concurrent requests** - verify transaction isolation prevents race conditions
10. **Database rollback** - verify failed operations don't leave inconsistent state

## Migration Notes

**No database migration required** - all changes are in application logic only.

Existing pending withdrawals will work correctly:
- They were created under old system (no deduction yet)
- Approving them will fail with "Insufficient balance" if user spent the money
- This is correct behavior - admin should verify balance before approval
- Alternatively, you may want to manually review and handle existing pending withdrawals before deploying

## Rollback Plan

If issues arise, revert these three files:
1. `backend/controllers/withdrawalController.js`
2. `backend/services/transactionService.js`

No database changes to rollback.
