# Membership Visibility Management Feature

## Overview
This feature allows administrators to hide or unhide membership tiers by selecting a range of ranks. Hidden memberships will not be visible to regular users when they view available membership tiers.

## Backend Changes

### 1. Model Updates (`backend/models/Membership.js`)
- Added `hidden` field (Boolean, default: false) to the Membership schema

### 2. Controller Updates (`backend/controllers/membershipController.js`)
- **Modified `getTiers`**: Now filters out hidden memberships for regular users
- **Added `getAllTiers`**: Returns all memberships including hidden ones (admin only)
- **Added `hideMembershipsByRange`**: Hides memberships within a specified rank range
- **Added `unhideMembershipsByRange`**: Unhides memberships within a specified rank range

### 3. Route Updates (`backend/routes/membership.js`)
Added three new admin-only routes:
- `GET /api/memberships/admin/all` - Get all tiers including hidden
- `PUT /api/memberships/admin/hide-range` - Hide memberships by rank range
- `PUT /api/memberships/admin/unhide-range` - Unhide memberships by rank range

## Frontend Changes

### 1. API Service (`admin/src/services/api.js`)
Added `adminMembershipAPI` with three methods:
- `getAllTiers()` - Fetch all membership tiers
- `hideRange(data)` - Hide memberships by rank range
- `unhideRange(data)` - Unhide memberships by rank range

### 2. New Admin Page (`admin/src/pages/MembershipManagement.jsx`)
Created a new page with:
- Control panel to select start and end ranks
- Buttons to hide/unhide selected range
- Table displaying all membership tiers with their visibility status

### 3. Navigation Updates
- Added route in `admin/src/App.jsx`
- Added navigation link in `admin/src/layout/AdminLayout.jsx`

## Usage

### For Administrators:
1. Navigate to "Membership Management" in the admin panel
2. Select a start rank (e.g., Rank 7)
3. Select an end rank (e.g., Rank 10)
4. Click "Hide Selected Range" to hide those memberships
5. Click "Unhide Selected Range" to make them visible again

### API Examples:

**Hide memberships from Rank 7 to Rank 10:**
```bash
PUT /api/memberships/admin/hide-range
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "startRank": 7,
  "endRank": 10
}
```

**Unhide memberships from Rank 5 to Rank 10:**
```bash
PUT /api/memberships/admin/unhide-range
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "startRank": 5,
  "endRank": 10
}
```

## Validation Rules
- Both start and end ranks are required
- Ranks must be between 1 and 10
- Start rank must be less than or equal to end rank
- Only authenticated admins can access these endpoints

## Impact on Users
- Regular users will only see visible (non-hidden) memberships when viewing tier lists
- Users with existing hidden membership levels can still use their accounts normally
- Hidden memberships cannot be selected for upgrades by users
