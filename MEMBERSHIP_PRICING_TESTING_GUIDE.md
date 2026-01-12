# Dynamic Membership Pricing - Testing Guide

## Overview
This guide provides comprehensive testing procedures for the dynamic membership pricing feature.

## Prerequisites

### Test Environment Setup
1. Backend server running on `http://localhost:5000`
2. Admin panel running on `http://localhost:5174` (or configured port)
3. Client app running on `http://localhost:5173` (or configured port)
4. MongoDB database accessible
5. Admin user credentials available

### Test Data Requirements
- At least one admin user account
- At least one regular user account
- Membership tiers seeded in database

## Test Scenarios

### 1. Backend API Testing

#### Test 1.1: Update Single Membership Price (Valid)
**Endpoint:** `PUT /api/memberships/admin/update-price/:id`

**Steps:**
1. Get membership ID from database or admin panel
2. Send PUT request with valid price
3. Verify response

**Request:**
```bash
curl -X PUT http://localhost:5000/api/memberships/admin/update-price/MEMBERSHIP_ID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"price": 5000}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Successfully updated Rank 1 price to 5000 ETB",
  "membership": {
    "_id": "...",
    "level": "Rank 1",
    "price": 5000,
    "dailyIncome": 166.67,
    "perVideoIncome": 33.33,
    "fourDayIncome": 666.68
  }
}
```

**Validation:**
- ✅ Status code: 200
- ✅ Success: true
- ✅ Price updated in response
- ✅ Calculations correct

#### Test 1.2: Update Price with Negative Value (Invalid)
**Request:**
```bash
curl -X PUT http://localhost:5000/api/memberships/admin/update-price/MEMBERSHIP_ID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"price": -1000}'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Price cannot be negative"
}
```

**Validation:**
- ✅ Status code: 400
- ✅ Success: false
- ✅ Error message clear

#### Test 1.3: Try to Change Intern Price (Invalid)
**Request:**
```bash
curl -X PUT http://localhost:5000/api/memberships/admin/update-price/INTERN_ID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"price": 1000}'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Intern membership must remain free (price = 0)"
}
```

**Validation:**
- ✅ Status code: 400
- ✅ Success: false
- ✅ Intern price protected

#### Test 1.4: Update Without Authentication (Invalid)
**Request:**
```bash
curl -X PUT http://localhost:5000/api/memberships/admin/update-price/MEMBERSHIP_ID \
  -H "Content-Type: application/json" \
  -d '{"price": 5000}'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

**Validation:**
- ✅ Status code: 401
- ✅ Authentication required

#### Test 1.5: Update as Regular User (Invalid)
**Request:**
```bash
curl -X PUT http://localhost:5000/api/memberships/admin/update-price/MEMBERSHIP_ID \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"price": 5000}'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Not authorized as admin"
}
```

**Validation:**
- ✅ Status code: 403
- ✅ Admin role required

#### Test 1.6: Bulk Update Multiple Prices
**Request:**
```bash
curl -X PUT http://localhost:5000/api/memberships/admin/bulk-update-prices \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "updates": [
      {"id": "RANK1_ID", "price": 3500},
      {"id": "RANK2_ID", "price": 10000}
    ]
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Successfully updated 2 membership price(s)",
  "updated": [
    {"id": "RANK1_ID", "level": "Rank 1", "price": 3500},
    {"id": "RANK2_ID", "level": "Rank 2", "price": 10000}
  ]
}
```

**Validation:**
- ✅ Status code: 200
- ✅ All prices updated
- ✅ Correct count returned

### 2. Admin Panel UI Testing

#### Test 2.1: View Membership Table
**Steps:**
1. Log in to admin panel
2. Navigate to Membership Management
3. Scroll to "All Membership Tiers" table

**Expected Results:**
- ✅ Table displays all membership tiers
- ✅ Prices shown correctly
- ✅ Daily income calculated correctly
- ✅ Per video income calculated correctly
- ✅ Edit buttons visible for Rank 1-10
- ✅ Edit button disabled for Intern
- ✅ "Dynamic Pricing Enabled" badge visible

#### Test 2.2: Enter Edit Mode
**Steps:**
1. Click Edit icon (📝) on any Rank tier
2. Observe UI changes

**Expected Results:**
- ✅ Price field becomes editable input
- ✅ Save button (✓) appears
- ✅ Cancel button (✕) appears
- ✅ Edit button disappears
- ✅ Input field has current price value
- ✅ Input field accepts numbers only

#### Test 2.3: Update Price Successfully
**Steps:**
1. Click Edit on Rank 1
2. Change price to 5000
3. Click Save button
4. Wait for response

**Expected Results:**
- ✅ Loading state shown during save
- ✅ Success message displayed
- ✅ Table refreshes with new price
- ✅ Daily income updated automatically
- ✅ Per video income updated automatically
- ✅ Edit mode exits
- ✅ Edit button reappears

#### Test 2.4: Cancel Edit
**Steps:**
1. Click Edit on any tier
2. Change price value
3. Click Cancel button

**Expected Results:**
- ✅ Edit mode exits immediately
- ✅ Original price restored
- ✅ No API call made
- ✅ Edit button reappears

#### Test 2.5: Try to Edit Intern
**Steps:**
1. Locate Intern row in table
2. Observe Edit button state

**Expected Results:**
- ✅ Edit button disabled/grayed out
- ✅ Tooltip shows "Intern price cannot be changed"
- ✅ Cannot enter edit mode

#### Test 2.6: Validation - Negative Price
**Steps:**
1. Click Edit on any tier
2. Enter negative value (e.g., -1000)
3. Try to save

**Expected Results:**
- ✅ Input validation prevents negative
- ✅ Or error message shown
- ✅ Price not updated

#### Test 2.7: Validation - Empty Price
**Steps:**
1. Click Edit on any tier
2. Clear the price field
3. Try to save

**Expected Results:**
- ✅ Save button disabled
- ✅ Or validation error shown
- ✅ Cannot save empty price

#### Test 2.8: Multiple Edits
**Steps:**
1. Edit and save Rank 1 price
2. Immediately edit and save Rank 2 price
3. Verify both updates

**Expected Results:**
- ✅ Both updates successful
- ✅ No conflicts or errors
- ✅ Table shows both new prices

### 3. Integration Testing

#### Test 3.1: Price Reflects in Client App
**Steps:**
1. Update Rank 1 price to 5000 in admin panel
2. Open client app
3. Navigate to Tier List page
4. Find Rank 1 tier

**Expected Results:**
- ✅ Rank 1 shows 5,000 ETB
- ✅ Daily income shows 166.67 ETB
- ✅ Per video shows 33.33 ETB

#### Test 3.2: Membership Upgrade Uses New Price
**Steps:**
1. Update Rank 1 price to 5000
2. Log in as regular user (Intern)
3. Navigate to Tier List
4. Click "Upgrade Now" on Rank 1
5. Select wallet and confirm

**Expected Results:**
- ✅ Upgrade modal shows 5,000 ETB cost
- ✅ Wallet deducted by 5,000 ETB
- ✅ User upgraded to Rank 1
- ✅ Success message shown

#### Test 3.3: Commission Calculation Uses New Price
**Steps:**
1. Update Rank 1 price to 5000
2. Have User A (with referral code)
3. Have User B register with User A's code
4. User B upgrades to Rank 1
5. Check User A's commission

**Expected Results:**
- ✅ Commission calculated on 5,000 ETB
- ✅ User A receives correct commission amount
- ✅ Commission record created

#### Test 3.4: Daily Income Calculation
**Steps:**
1. Update Rank 1 price to 5000
2. User with Rank 1 membership
3. Complete daily video tasks
4. Check earnings

**Expected Results:**
- ✅ Per video earning: 33.33 ETB
- ✅ Daily total: 166.67 ETB (5 videos)
- ✅ Income wallet updated correctly

#### Test 3.5: Multiple Price Changes
**Steps:**
1. Update Rank 1 to 5000
2. User upgrades to Rank 1
3. Update Rank 2 to 12000
4. Same user upgrades to Rank 2
5. Verify both transactions

**Expected Results:**
- ✅ First upgrade: 5,000 ETB deducted
- ✅ Second upgrade: 12,000 ETB deducted
- ✅ User at Rank 2
- ✅ Earnings based on Rank 2 price

### 4. Database Verification

#### Test 4.1: Check Database After Update
**Steps:**
1. Update Rank 1 price to 5000 via admin panel
2. Query MongoDB directly

**MongoDB Query:**
```javascript
db.memberships.findOne({ level: "Rank 1" })
```

**Expected Result:**
```json
{
  "_id": "...",
  "level": "Rank 1",
  "price": 5000,
  "canWithdraw": true,
  "canUseTransactionPassword": true,
  "order": 1,
  "hidden": false,
  "createdAt": "...",
  "updatedAt": "..." // Should be recent
}
```

**Validation:**
- ✅ Price field updated
- ✅ updatedAt timestamp recent
- ✅ Other fields unchanged

#### Test 4.2: Verify Calculations
**Steps:**
1. Get membership from database
2. Calculate values manually
3. Compare with API response

**Manual Calculations:**
```
Price: 5000 ETB
Daily Income: 5000 ÷ 30 = 166.67 ETB
Per Video: 166.67 ÷ 5 = 33.33 ETB
4-Day Income: 166.67 × 4 = 666.68 ETB
```

**Validation:**
- ✅ Calculations match
- ✅ Rounding correct
- ✅ No precision errors

### 5. Error Handling Testing

#### Test 5.1: Network Error
**Steps:**
1. Stop backend server
2. Try to update price in admin panel
3. Observe error handling

**Expected Results:**
- ✅ Error message displayed
- ✅ UI doesn't break
- ✅ Can retry after server restart

#### Test 5.2: Invalid Membership ID
**Steps:**
1. Send API request with fake ID
2. Check response

**Expected Results:**
- ✅ 404 error returned
- ✅ Clear error message
- ✅ No database changes

#### Test 5.3: Concurrent Updates
**Steps:**
1. Open admin panel in two browsers
2. Edit same tier in both
3. Save from both simultaneously

**Expected Results:**
- ✅ Both requests processed
- ✅ Last update wins
- ✅ No data corruption
- ✅ Both UIs refresh correctly

### 6. Performance Testing

#### Test 6.1: Update Response Time
**Steps:**
1. Update a membership price
2. Measure response time

**Expected Results:**
- ✅ Response < 500ms
- ✅ UI updates smoothly
- ✅ No lag or freezing

#### Test 6.2: Bulk Update Performance
**Steps:**
1. Update all 10 ranks at once
2. Measure total time

**Expected Results:**
- ✅ All updates complete < 2 seconds
- ✅ No timeouts
- ✅ All prices updated correctly

#### Test 6.3: Page Load with Many Tiers
**Steps:**
1. Load Membership Management page
2. Measure load time

**Expected Results:**
- ✅ Page loads < 1 second
- ✅ Table renders smoothly
- ✅ All data displayed correctly

### 7. Security Testing

#### Test 7.1: SQL Injection Attempt
**Steps:**
1. Try to inject SQL in price field
2. Send malicious payload

**Request:**
```bash
curl -X PUT http://localhost:5000/api/memberships/admin/update-price/ID \
  -H "Authorization: Bearer TOKEN" \
  -d '{"price": "5000; DROP TABLE memberships;"}'
```

**Expected Results:**
- ✅ Request rejected
- ✅ No database damage
- ✅ Error message returned

#### Test 7.2: XSS Attempt
**Steps:**
1. Try to inject script in price field
2. Check if sanitized

**Expected Results:**
- ✅ Script not executed
- ✅ Input sanitized
- ✅ Safe error handling

#### Test 7.3: Token Expiration
**Steps:**
1. Use expired admin token
2. Try to update price

**Expected Results:**
- ✅ 401 Unauthorized
- ✅ Redirected to login
- ✅ No update performed

## Test Checklist

### Backend API
- [ ] Update single price (valid)
- [ ] Update with negative price (invalid)
- [ ] Update Intern price (invalid)
- [ ] Update without auth (invalid)
- [ ] Update as regular user (invalid)
- [ ] Bulk update prices
- [ ] Invalid membership ID
- [ ] Missing price field
- [ ] Non-numeric price

### Admin Panel UI
- [ ] View membership table
- [ ] Enter edit mode
- [ ] Update price successfully
- [ ] Cancel edit
- [ ] Try to edit Intern
- [ ] Validation - negative price
- [ ] Validation - empty price
- [ ] Multiple consecutive edits
- [ ] Loading states
- [ ] Error messages
- [ ] Success messages

### Integration
- [ ] Price reflects in client app
- [ ] Membership upgrade uses new price
- [ ] Commission calculation correct
- [ ] Daily income calculation correct
- [ ] Multiple price changes
- [ ] Tier list updates
- [ ] Upgrade modal updates

### Database
- [ ] Price updated in DB
- [ ] Timestamp updated
- [ ] Other fields unchanged
- [ ] Calculations correct

### Error Handling
- [ ] Network errors
- [ ] Invalid IDs
- [ ] Concurrent updates
- [ ] Server errors

### Performance
- [ ] Update response time
- [ ] Bulk update performance
- [ ] Page load time

### Security
- [ ] SQL injection prevented
- [ ] XSS prevented
- [ ] Token validation
- [ ] Role validation
- [ ] Input sanitization

## Automated Testing (Optional)

### Unit Tests Example
```javascript
describe('Membership Price Update', () => {
  it('should update price successfully', async () => {
    const response = await updatePrice(membershipId, 5000);
    expect(response.success).toBe(true);
    expect(response.membership.price).toBe(5000);
  });

  it('should reject negative price', async () => {
    const response = await updatePrice(membershipId, -1000);
    expect(response.success).toBe(false);
    expect(response.message).toContain('negative');
  });

  it('should protect Intern price', async () => {
    const response = await updatePrice(internId, 1000);
    expect(response.success).toBe(false);
    expect(response.message).toContain('Intern');
  });
});
```

### Integration Tests Example
```javascript
describe('Price Update Integration', () => {
  it('should reflect in client app', async () => {
    await updatePrice(rank1Id, 5000);
    const tiers = await getTiers();
    const rank1 = tiers.find(t => t.level === 'Rank 1');
    expect(rank1.price).toBe(5000);
  });

  it('should affect membership upgrades', async () => {
    await updatePrice(rank1Id, 5000);
    const result = await upgradeMembership('Rank 1', 'personal');
    expect(result.user.personalWallet).toBe(initialWallet - 5000);
  });
});
```

## Test Report Template

### Test Execution Summary
- **Date:** [Date]
- **Tester:** [Name]
- **Environment:** [Dev/Staging/Prod]
- **Total Tests:** [Number]
- **Passed:** [Number]
- **Failed:** [Number]
- **Blocked:** [Number]

### Failed Tests
| Test ID | Description | Expected | Actual | Severity |
|---------|-------------|----------|--------|----------|
| 1.2 | Negative price | Error | Accepted | High |

### Issues Found
1. **Issue:** [Description]
   - **Severity:** High/Medium/Low
   - **Steps to Reproduce:** [Steps]
   - **Expected:** [Expected behavior]
   - **Actual:** [Actual behavior]

### Recommendations
- [Recommendation 1]
- [Recommendation 2]

## Conclusion

This testing guide covers all aspects of the dynamic membership pricing feature. Follow these tests to ensure the feature works correctly before deploying to production.

**Remember:** Always test in a development environment first, then staging, before production deployment.
