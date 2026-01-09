# Deployment Instructions - Commission & Salary Rules Fix

## What Was Fixed
The system was incorrectly counting Intern referrals and higher-level referrals in the Salary Status (Total Team and A-Level sections). This has been completely fixed.

## Files Modified
1. `backend/utils/commission.js` - Commission calculation logic
2. `backend/utils/salary.js` - Salary calculation logic
3. `backend/controllers/referralController.js` - Downline display API

## Deployment Steps

### Step 1: Restart Backend Server
```bash
cd backend
# If using nodemon (development)
# It should auto-restart, or manually restart:
npm run dev

# If using pm2 (production)
pm2 restart backend

# If running directly
# Stop the current process (Ctrl+C) and restart:
node server.js
```

### Step 2: Verify Backend is Running
Check the console for any errors. You should see:
```
Server running on port XXXX
MongoDB connected
```

### Step 3: Test the Changes (Optional but Recommended)
```bash
cd backend
node scripts/test_commission_rules.js
```

This will verify the logic is working correctly.

### Step 4: Clear Frontend Cache (If Needed)
If users are still seeing old data:
1. Have users refresh their browser (Ctrl+F5 or Cmd+Shift+R)
2. Or clear browser cache
3. The API will now return corrected counts automatically

## What Users Will See After Deployment

### Before Fix:
- Total Team: 25 (including 10 Interns)
- A-Level: 15 (including 5 Interns)
- Salary progress showing inflated numbers

### After Fix:
- Total Team: 15 (only qualified referrals)
- A-Level: 10 (only qualified referrals)
- Salary progress showing accurate numbers

## Important Notes

### ✅ What This Fix Does:
- Excludes Interns from commission calculations
- Excludes higher-level referrals from commission calculations
- Excludes Interns from salary counting
- Excludes higher-level referrals from salary counting
- Updates the Team page to show only qualified referrals

### ❌ What This Fix Does NOT Do:
- Does NOT modify existing commission records in database
- Does NOT retroactively recalculate past commissions
- Does NOT affect historical data

### Future Behavior:
- New task completions will calculate commissions correctly
- New membership upgrades will calculate commissions correctly
- Salary calculations will count only qualified referrals
- Team page will display only qualified referrals

## Rollback (If Needed)
If you need to rollback these changes:
1. Use git to revert the three modified files
2. Restart the backend server

```bash
git checkout HEAD~1 backend/utils/commission.js
git checkout HEAD~1 backend/utils/salary.js
git checkout HEAD~1 backend/controllers/referralController.js
# Then restart server
```

## Support
If you encounter any issues:
1. Check backend console for errors
2. Check browser console for API errors
3. Verify MongoDB connection is stable
4. Run the test script to verify logic

## Verification Checklist
After deployment, verify:
- [ ] Backend server starts without errors
- [ ] Users can log in successfully
- [ ] Team page loads correctly
- [ ] Intern referrals are NOT counted in Total Team
- [ ] Intern referrals are NOT counted in A-Level
- [ ] Salary progress bars show correct numbers
- [ ] New commissions are calculated correctly
