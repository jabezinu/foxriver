# Bank Account Issue Fix Guide

## Problem Description
Bank accounts are being saved successfully in the deployed database, but the client-side Settings page shows "Not linked" instead of displaying the bank account information. This issue only occurs in the deployed/remote environment, not locally.

## Root Cause Analysis
The issue is likely caused by one of the following:

1. **JSON Field Handling**: MySQL JSON fields might be stored/retrieved differently in the remote database
2. **Database Schema Differences**: The remote database might have a different schema or default values
3. **Environment Configuration**: Different database configurations between local and remote environments
4. **Data Serialization**: Issues with how JSON data is being serialized/deserialized

## Implemented Fixes

### 1. Enhanced Logging
- Added comprehensive logging to `userController.js` `getProfile` method
- Added logging to client-side `fetchProfile` function
- Added logging to `setBankAccount` method with data verification

### 2. Improved JSON Field Handling
- Enhanced `User.js` model with custom getters for `bankAccount` and `pendingBankAccount` fields
- Added error handling for JSON parsing issues
- Changed default value from object to null to prevent schema conflicts

### 3. Diagnostic Tools
- Created `diagnose-bank-account-issue.js` script for comprehensive database analysis
- Added debug API endpoints:
  - `/api/debug/user-bank-account/:userId` - Check specific user's bank account data
  - `/api/debug/diagnose-bank-accounts` - Run full diagnosis
- Created `BankAccountDebug` React component for client-side debugging

### 4. Database Fix Script
- Created `fix-bank-account-field.js` to repair any malformed data in the database
- Handles cases where JSON fields might be stored as strings or have missing properties

## Deployment Instructions

### Step 1: Deploy the Fixes
1. Upload the updated code to your server
2. Run the deployment script:
   ```bash
   chmod +x scripts/deploy-fix-bank-account.sh
   ./scripts/deploy-fix-bank-account.sh
   ```

### Step 2: Manual Diagnosis (if needed)
If the script doesn't work, run these commands manually:

```bash
# Navigate to backend directory
cd backend

# Run diagnosis
node scripts/diagnose-bank-account-issue.js

# Fix database issues
node scripts/fix-bank-account-field.js

# Restart your server (choose appropriate command)
pm2 restart all
# OR
systemctl restart your-app-name
# OR
docker-compose restart backend
```

### Step 3: Test the Fix
1. Open your deployed application
2. Go to Settings page
3. Check browser console for debug logs
4. Try adding/updating a bank account
5. Verify the bank account status shows correctly

### Step 4: API Testing
You can also test directly via API:
- Visit `https://your-domain.com/api/debug/diagnose-bank-accounts` to see diagnosis
- Visit `https://your-domain.com/api/debug/user-bank-account/USER_ID` to check specific user

## Files Modified

### Backend Files:
- `backend/controllers/userController.js` - Enhanced logging and error handling
- `backend/models/User.js` - Improved JSON field handling
- `backend/server.js` - Added debug endpoints
- `backend/scripts/diagnose-bank-account-issue.js` - New diagnostic script
- `backend/scripts/fix-bank-account-field.js` - New fix script

### Frontend Files:
- `client/src/pages/Settings.jsx` - Enhanced logging and debug component
- `client/src/components/BankAccountDebug.jsx` - New debug component

## Cleanup After Fix
Once the issue is resolved:

1. Remove debug logging from production code
2. Remove the `BankAccountDebug` component from Settings page
3. Remove or secure the debug API endpoints
4. Remove the diagnostic scripts if no longer needed

## Common Issues and Solutions

### Issue: "JSON_EXTRACT" errors
**Solution**: The database might not support JSON functions. The fix script handles this by using Sequelize ORM instead of raw SQL.

### Issue: Bank account shows as object but isSet is false
**Solution**: Run the fix script to ensure all bank accounts have the correct `isSet` property.

### Issue: Data appears in database but not in API response
**Solution**: Check the custom getters in the User model - they handle JSON parsing issues.

## Environment Variables to Check
Ensure these are correctly set in your deployed environment:
- `DB_HOST`
- `DB_USER` 
- `DB_PASSWORD`
- `DB_NAME`
- `DB_DIALECT`

## Support
If the issue persists after following this guide:
1. Check the server logs for any error messages
2. Run the diagnostic script and share the output
3. Check the browser console for any client-side errors
4. Verify the database connection is working properly