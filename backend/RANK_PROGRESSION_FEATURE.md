# Rank Progression Restriction Feature

## Overview
This feature allows users to skip membership ranks freely by default, but gives admins the ability to define a restricted rank range where sequential progression is mandatory.

## Default Behavior
- Users can upgrade from any rank to any higher rank without restrictions
- Example: A user at Rank 1 can directly upgrade to Rank 5
- Example: A user at Rank 3 can directly upgrade to Rank 10

## Restricted Range Behavior
When an admin sets a restricted range (e.g., Rank 7 to Rank 10):
- Users must progress sequentially within the restricted range
- A user at Rank 7 must upgrade to Rank 8 (cannot skip to Rank 9 or 10)
- A user at Rank 8 must upgrade to Rank 9 (cannot skip to Rank 10)
- Users outside the restricted range can still skip ranks freely
- Users can only enter the restricted range at its starting rank

## API Endpoints

### Admin Endpoints

#### Set Restricted Range
```
PUT /api/memberships/admin/set-restricted-range
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "startRank": 7,
  "endRank": 10
}
```

**Response:**
```json
{
  "success": true,
  "message": "Sequential progression is now required from Rank 7 to Rank 10",
  "restrictedRange": {
    "start": 7,
    "end": 10
  }
}
```

#### Get Restricted Range
```
GET /api/memberships/admin/restricted-range
Authorization: Bearer <admin_token>
```

**Response (when set):**
```json
{
  "success": true,
  "restrictedRange": {
    "start": 7,
    "end": 10
  },
  "message": "Sequential progression required from Rank 7 to Rank 10"
}
```

**Response (when not set):**
```json
{
  "success": true,
  "restrictedRange": null,
  "message": "No rank progression restrictions are currently set"
}
```

#### Clear Restricted Range
```
DELETE /api/memberships/admin/restricted-range
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Rank progression restrictions have been cleared. Users can now skip ranks freely."
}
```

### User Endpoint

#### Upgrade Membership
```
POST /api/memberships/upgrade
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "newLevel": "Rank 8",
  "walletType": "income"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Successfully upgraded to Rank 8",
  "user": {
    "membershipLevel": "Rank 8",
    "incomeWallet": 5000,
    "personalWallet": 2000
  }
}
```

**Error Response (when restriction violated):**
```json
{
  "success": false,
  "message": "Sequential progression is required from Rank 7 to Rank 10. You must join Rank 8 next."
}
```

## Examples

### Example 1: No Restrictions
- Admin has not set any restricted range
- User at Rank 1 can upgrade to Rank 5 ✅
- User at Rank 3 can upgrade to Rank 10 ✅

### Example 2: Restricted Range (Rank 7-10)
- Admin sets restricted range: Rank 7 to Rank 10
- User at Rank 1 can upgrade to Rank 5 ✅ (outside restricted range)
- User at Rank 5 can upgrade to Rank 7 ✅ (entering at start of range)
- User at Rank 5 can upgrade to Rank 8 ❌ (must enter at Rank 7)
- User at Rank 7 can upgrade to Rank 8 ✅ (sequential within range)
- User at Rank 7 can upgrade to Rank 9 ❌ (must go to Rank 8 first)
- User at Rank 8 can upgrade to Rank 9 ✅ (sequential within range)
- User at Rank 10 can upgrade to any higher rank if available ✅

### Example 3: Restricted Range (Rank 3-5)
- Admin sets restricted range: Rank 3 to Rank 5
- User at Rank 1 can upgrade to Rank 3 ✅ (entering at start of range)
- User at Rank 1 can upgrade to Rank 4 ❌ (must enter at Rank 3)
- User at Rank 3 can upgrade to Rank 4 ✅ (sequential within range)
- User at Rank 4 can upgrade to Rank 5 ✅ (sequential within range)
- User at Rank 5 can upgrade to Rank 10 ✅ (outside restricted range)

## Implementation Details

### Database Schema
The restricted range is stored in the `Intern` membership document:
```javascript
{
  restrictedRangeStart: Number,  // e.g., 7
  restrictedRangeEnd: Number     // e.g., 10
}
```

### Validation Logic
The `Membership.isProgressionAllowed()` static method checks:
1. Target rank must be higher than current rank
2. If no restriction is set, allow any progression
3. If within restricted range, only allow sequential progression (currentRank + 1)
4. If entering restricted range, only allow entry at the start rank

### Model Methods
- `Membership.getRestrictedRange()` - Returns the current restricted range or null
- `Membership.isProgressionAllowed(currentLevel, targetLevel)` - Validates if progression is allowed

## Testing

### Test Scenario 1: Set and Clear Restrictions
1. Set restricted range from Rank 7 to Rank 10
2. Verify restriction is saved
3. Clear restriction
4. Verify restriction is removed

### Test Scenario 2: Sequential Progression
1. Set restricted range from Rank 7 to Rank 10
2. Create user at Rank 7
3. Try to upgrade to Rank 9 (should fail)
4. Upgrade to Rank 8 (should succeed)
5. Upgrade to Rank 9 (should succeed)

### Test Scenario 3: Free Progression Outside Range
1. Set restricted range from Rank 7 to Rank 10
2. Create user at Rank 1
3. Upgrade to Rank 5 (should succeed)
4. Upgrade to Rank 7 (should succeed)

## Notes
- The restriction applies to all users system-wide
- Only one restricted range can be active at a time
- The restricted range must include at least 2 ranks
- Ranks must be between 1 and 10
- The feature is backward compatible - existing systems work without restrictions
