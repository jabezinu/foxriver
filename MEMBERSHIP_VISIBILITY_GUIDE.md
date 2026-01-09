# Membership Visibility Management - Quick Guide

## Overview
This feature allows admins to control which membership tiers are visible to users by hiding or unhiding them based on rank ranges.

## Access the Feature
1. Log in to the admin panel
2. Navigate to **Membership Management** in the sidebar (shield icon)

## Hide Memberships

### Example 1: Hide Rank 7 to Rank 10
1. Select **Start Rank**: Rank 7
2. Select **End Rank**: Rank 10
3. Click **"Hide Selected Range"**
4. Result: Ranks 7, 8, 9, and 10 will be hidden from users

### Example 2: Hide Rank 5 to Rank 10
1. Select **Start Rank**: Rank 5
2. Select **End Rank**: Rank 10
3. Click **"Hide Selected Range"**
4. Result: Ranks 5, 6, 7, 8, 9, and 10 will be hidden from users

## Unhide Memberships

### Example: Unhide Rank 5 to Rank 10
1. Select **Start Rank**: Rank 5
2. Select **End Rank**: Rank 10
3. Click **"Unhide Selected Range"**
4. Result: Ranks 5, 6, 7, 8, 9, and 10 will be visible to users again

## Visual Indicators

In the membership table, you'll see:
- 🟢 **Green badge with eye icon**: Membership is visible to users
- 🔴 **Red badge with eye-off icon**: Membership is hidden from users

## Important Notes

✅ **What happens when you hide a membership:**
- Users cannot see it in the tier list
- Users cannot upgrade to it
- Existing users with that membership level keep their access

✅ **What happens when you unhide a membership:**
- Users can see it in the tier list again
- Users can upgrade to it again

⚠️ **Limitations:**
- You can only hide Rank 1 through Rank 10
- The "Intern" level cannot be hidden (it's not a rank)
- Start rank must be ≤ end rank

## Use Cases

### Scenario 1: Temporarily disable high-tier memberships
Hide Rank 8 to Rank 10 during a promotional period

### Scenario 2: Phase out old tiers
Hide Rank 1 to Rank 3 when introducing new pricing

### Scenario 3: Limit available options
Hide Rank 6 to Rank 10 for new user onboarding

### Scenario 4: Re-enable all tiers
Unhide Rank 1 to Rank 10 to restore full access

## Technical Details

### API Endpoints
- **Get all tiers (admin)**: `GET /api/memberships/admin/all`
- **Hide range**: `PUT /api/memberships/admin/hide-range`
- **Unhide range**: `PUT /api/memberships/admin/unhide-range`

### Request Format
```json
{
  "startRank": 7,
  "endRank": 10
}
```

### Response Format
```json
{
  "success": true,
  "message": "Successfully hidden memberships from Rank 7 to Rank 10",
  "modifiedCount": 4
}
```
