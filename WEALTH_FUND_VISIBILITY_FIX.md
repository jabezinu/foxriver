# Wealth Fund Visibility Fix

## Issue Summary
Wealth funds created in the admin panel were not visible on the user page.

## Root Causes Identified

### 1. Image URL Construction Issue
**Problem**: The client-side pages were using the image path directly from the API response without prepending the server URL.

**Example**:
- Backend returns: `/uploads/wealth/wealth-123456.jpg`
- Client was using: `/uploads/wealth/wealth-123456.jpg` (broken link)
- Should be: `http://localhost:5002/uploads/wealth/wealth-123456.jpg`

**Impact**: Even if funds were visible, their images would not load properly.

### 2. Active Status Filter
**Problem**: The user endpoint filters funds by `isActive: true`, while the admin endpoint shows all funds.

**Backend Logic**:
```javascript
// User endpoint - only shows active funds
exports.getWealthFunds = async (req, res) => {
    const funds = await WealthFund.findAll({ 
        where: { isActive: true },
        order: [['createdAt', 'DESC']]
    });
};

// Admin endpoint - shows all funds
exports.getAllWealthFunds = async (req, res) => {
    const funds = await WealthFund.findAll({ 
        order: [['createdAt', 'DESC']]
    });
};
```

**Impact**: If a fund is created with `isActive: false` or toggled to inactive, it won't appear on the user page.

## Fixes Applied

### Client-Side Changes

#### 1. `client/src/pages/Wealth.jsx`
- Added import: `import { getServerUrl } from '../config/api.config';`
- Added helper function: `renderImageUrl()` to properly construct image URLs
- Updated image src to use: `src={renderImageUrl(fund.image)}`

#### 2. `client/src/pages/WealthDetail.jsx`
- Added import: `import { getServerUrl } from '../config/api.config';`
- Added helper function: `renderImageUrl()` to properly construct image URLs
- Updated image src to use: `src={renderImageUrl(fund.image)}`

#### 3. `client/src/pages/MyInvestments.jsx`
- Added import: `import { getServerUrl } from '../config/api.config';`
- Added helper function: `renderImageUrl()` to properly construct image URLs
- Updated image src to use: `src={renderImageUrl(investment.wealthFund?.image)}`

### Helper Function Added
```javascript
const renderImageUrl = (image) => {
    if (!image) return null;
    return image.startsWith('http') ? image : `${getServerUrl()}${image}`;
};
```

This function:
- Returns null if no image is provided
- Returns the URL as-is if it's already a full URL (starts with 'http')
- Prepends the server URL if it's a relative path

## How to Verify the Fix

### 1. Check Existing Funds
In the admin panel:
- Go to Wealth Management
- Check if funds have `isActive` toggle enabled (green)
- If any funds are inactive (gray), toggle them to active

### 2. Test Image Display
- Create a new wealth fund in the admin panel with an image
- Ensure the `isActive` toggle is ON (green)
- Navigate to the user page at `/wealth`
- Verify the fund appears with its image properly displayed

### 3. Test Investment Flow
- Click on a fund in the user page
- Verify the fund details page shows the image correctly
- Create a test investment
- Check "My Investments" page to ensure images display there too

## Prevention Tips

### For Admins
1. Always ensure the "Set as Active" toggle is enabled when creating new funds
2. The toggle description states: "If disabled, this fund will be hidden from the client side"
3. Use the inactive state only for funds you want to temporarily hide or are preparing

### For Developers
1. Always use `getServerUrl()` helper when displaying uploaded images
2. Remember that relative paths from the backend need the server URL prepended
3. The pattern is: `{getServerUrl()}{relativePath}`

## Technical Notes

### Image Upload Flow
1. Admin uploads image via form
2. Backend saves to `uploads/wealth/` directory
3. Backend stores path as `/uploads/wealth/filename.jpg` in database
4. Client must prepend server URL to display: `http://localhost:5002/uploads/wealth/filename.jpg`

### Active Status Default
The WealthFund model has `isActive` defaulting to `true`:
```javascript
isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
}
```

However, the admin form explicitly controls this value, so it depends on the form state.

## Files Modified
- ✅ `client/src/pages/Wealth.jsx`
- ✅ `client/src/pages/WealthDetail.jsx`
- ✅ `client/src/pages/MyInvestments.jsx`

## Status
✅ **FIXED** - All client-side pages now properly construct image URLs and will display wealth funds correctly when they are marked as active in the admin panel.
