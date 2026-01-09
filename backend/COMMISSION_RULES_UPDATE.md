# Commission and Salary Rules Update

## Overview
Updated the commission and salary calculation logic to ensure that inviters only receive commissions and salary credit when their referred users have a membership level that is **equal to or lower** than the inviter's level, and the referred user is **not an Intern**.

## Business Rules

### Commission Rules
An inviter receives commission from a referred user's activities (tasks or membership purchases) ONLY when:
1. The referred user is **NOT an Intern**
2. The referred user's membership level is **equal to or lower** than the inviter's level

### Salary Status Rules
For monthly salary calculations based on downline counts, only referrals that meet the following criteria are counted:
1. The referral is **NOT an Intern**
2. The referral's membership level is **equal to or lower** than the inviter's level

## Examples

### Example 1: V1 Inviter → Intern Referral
- **Inviter:** Mr. X with V1 membership (order = 1)
- **Referral:** Mr. Y stays as Intern (order = 0)
- **Result:** 
  - ❌ Mr. X gets NO commission from Mr. Y's activities
  - ❌ Mr. Y is NOT counted for Mr. X's salary status

### Example 2: V1 Inviter → V1 Referral (Equal Level)
- **Inviter:** Mr. X with V1 membership (order = 1)
- **Referral:** Mr. Y upgrades to V1 (order = 1)
- **Result:** 
  - ✅ Mr. X gets commission from Mr. Y's activities
  - ✅ Mr. Y is counted for Mr. X's salary status

### Example 3: V1 Inviter → V2 Referral (Higher Level)
- **Inviter:** Mr. X with V1 membership (order = 1)
- **Referral:** Mr. Y upgrades to V2 (order = 2)
- **Result:** 
  - ❌ Mr. X gets NO commission from Mr. Y's activities
  - ❌ Mr. Y is NOT counted for Mr. X's salary status

## Technical Implementation

### Membership Order System
```
Intern: order = 0 (lowest)
V1:     order = 1
V2:     order = 2
V3:     order = 3
...
V10:    order = 10 (highest)
```

Higher order number = higher membership level

### Logic Condition
```javascript
// For commission eligibility:
if (referralMembershipLevel !== 'Intern' && referralOrder <= inviterOrder) {
    // Grant commission
}

// For salary counting:
if (referralMembershipLevel !== 'Intern' && referralOrder <= inviterOrder) {
    // Count this referral
}
```

## Files Modified

### 1. `backend/utils/commission.js`
- **Function:** `calculateAndCreateCommissions` (Task commissions)
  - Updated A-level, B-level, and C-level commission logic
  - Added Intern exclusion check
  - Changed comparison from `>=` to `<=` for order comparison

- **Function:** `calculateAndCreateMembershipCommissions` (Membership purchase commissions)
  - Updated A-level, B-level, and C-level commission logic
  - Added Intern exclusion check
  - Changed comparison from `>=` to `<=` for order comparison

### 2. `backend/utils/salary.js`
- **Function:** `calculateMonthlySalary`
  - Updated filtering logic for A-level, B-level, and C-level referrals
  - Added Intern exclusion check
  - Changed comparison from `>=` to `<=` for order comparison
  - Added safety checks to prevent querying with empty ID arrays

### 3. `backend/controllers/referralController.js`
- **Function:** `getDownline`
  - **CRITICAL FIX:** This endpoint was showing ALL referrals without filtering
  - Now filters referrals to only show qualified ones (not Intern, equal or lower level)
  - Returns both `count` (qualified) and `totalCount` (all) for transparency
  - Returns both `users` (qualified) and `allUsers` (all) arrays
  - The `total` field now shows only qualified referrals count
  - Added `totalAll` field to show all referrals count (including Interns and higher levels)

## Testing

A test script has been created at `backend/scripts/test_commission_rules.js` to verify the implementation.

To run the test:
```bash
cd backend
node scripts/test_commission_rules.js
```

The test will:
1. Verify that Intern referrals don't generate commissions
2. Verify that equal-level referrals generate commissions
3. Verify that higher-level referrals don't generate commissions
4. Show the logic verification with actual order numbers

## Impact

### Positive Impact
- Ensures fair commission distribution
- Prevents gaming the system by inviting users who upgrade beyond the inviter's level
- Encourages inviters to upgrade their own membership to earn from higher-level referrals

### Migration Considerations
- Existing commissions in the database are not affected (historical data remains)
- Only future commissions and salary calculations will use the new logic
- No database migration is required
