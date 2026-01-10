# Bank Account Duplicate Prevention

## Overview
The system now prevents multiple users from registering the same bank account. This ensures each bank account can only be linked to one user at a time.

## Implementation Details

### 1. User Bank Account Setup (`setBankAccount`)
When a user sets or updates their bank account:
- The system checks if any other user already has the same bank account (same bank + account number)
- Checks both active bank accounts and pending bank account changes
- If a duplicate is found, the request is rejected with an error message
- If no duplicate exists, the bank account is saved or queued for approval

### 2. Auto-Approval (3-Day Rule)
When a pending bank account change reaches 3 days:
- Before auto-approving, the system checks for duplicates again
- If a duplicate is found, the change remains pending for admin review
- If no duplicate exists, the change is auto-approved

### 3. Admin Manual Approval
When an admin manually approves a bank account change:
- The system validates there are no duplicates before approval
- If a duplicate is found, the approval is rejected with an error message
- This prevents admins from accidentally approving duplicate accounts

## Validation Logic

The duplicate check searches for:
```javascript
{
  _id: { $ne: currentUserId }, // Exclude current user
  $or: [
    { 'bankAccount.accountNumber': accountNumber, 'bankAccount.bank': bank },
    { 'pendingBankAccount.accountNumber': accountNumber, 'pendingBankAccount.bank': bank }
  ]
}
```

This ensures:
- Users can update their own bank account
- No other user (active or pending) has the same bank + account number combination

## Testing

Run the test script to check for existing duplicates:
```bash
node backend/test_bank_duplicate.js
```

The test script will:
1. Check for duplicate active bank accounts
2. Check for duplicate pending bank accounts
3. Check for conflicts between active and pending accounts

## Error Messages

Users will see:
- "This bank account is already registered to another user" - when trying to set a duplicate bank account

Admins will see:
- "This bank account is already registered to another user" - when trying to approve a duplicate bank account change

## Files Modified

1. `backend/controllers/userController.js`
   - Updated `setBankAccount()` - Added duplicate validation
   - Updated `getProfile()` - Added duplicate check before auto-approval

2. `backend/controllers/adminController.js`
   - Updated user update endpoint - Added duplicate validation for manual approval

## Notes

- The validation is case-sensitive for account numbers
- Both the bank name and account number must match to be considered a duplicate
- Users can still update their own bank account information
- The system prevents duplicates at all stages: initial setup, pending changes, and approvals
