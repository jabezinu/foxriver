# Automatic Monthly Salary System

## Overview
The system now automatically processes and pays monthly salaries to eligible users. Salaries are calculated based on the user's referral network and credited directly to their income wallet.

## How It Works

### Automatic Processing
- **Schedule**: Runs daily at 00:01 AM (Ethiopian Time)
- **Frequency**: Checks all active users every day
- **Payment**: Users are paid once per month when they meet requirements
- **Protection**: Built-in duplicate payment prevention

### Salary Calculation Rules
Salaries are calculated based on the user's referral network:

1. **Direct Referrals (A-Level)**: Users directly referred by the person
2. **B-Level Referrals**: Users referred by A-level referrals
3. **C-Level Referrals**: Users referred by B-level referrals

**Important**: Only counts referrals who are:
- Not "Intern" level
- Same membership level or lower than the inviter

### Salary Tiers (Configurable in System Settings)
- **10 Direct Referrals**: 10,000 ETB/month
- **15 Direct Referrals**: 15,000 ETB/month
- **20 Direct Referrals**: 20,000 ETB/month
- **40 Total Network**: 48,000 ETB/month (highest priority)

The system automatically selects the highest applicable salary tier.

## Technical Implementation

### Files Created/Modified

#### New Files:
1. **backend/services/salaryScheduler.js**
   - Main scheduler service using node-cron
   - Handles automatic daily processing
   - Provides manual trigger functions

#### Modified Files:
1. **backend/server.js**
   - Initializes salary scheduler on startup

2. **backend/controllers/adminController.js**
   - Updated `processMonthlySalaries()` to use scheduler service
   - Added `processUserSalary()` for individual user processing
   - Updated `getAllUsers()` to include salary calculation

3. **backend/routes/admin.js**
   - Added route: `POST /api/admin/salaries/process/:userId`

4. **admin/src/pages/Users.jsx**
   - Added "Monthly Salary" column to users table
   - Displays calculated salary for each user

5. **admin/src/pages/SystemSettings.jsx**
   - Added salary processing section
   - Manual trigger button for immediate processing
   - Status information and documentation

### Database Schema

#### Salary Model (backend/models/Salary.js)
```javascript
{
  user: ObjectId,           // Reference to User
  amount: Number,           // Salary amount paid
  month: Number,            // Month (1-12)
  year: Number,             // Year
  breakdown: {
    aLevel: Number,         // Count of A-level referrals
    bLevel: Number,         // Count of B-level referrals
    cLevel: Number,         // Count of C-level referrals
    total: Number           // Total network count
  },
  ruleApplied: String,      // Which salary rule was applied
  timestamps: true
}
```

#### User Model Updates
- `lastSalaryDate`: Tracks when user was last paid
- `incomeWallet`: Credited with salary amount

## API Endpoints

### Process All Salaries
```
POST /api/admin/salaries/process
Authorization: Bearer <admin_token>

Response:
{
  "success": true,
  "message": "Successfully processed salaries for X users",
  "processedCount": 5,
  "totalPaid": 75000
}
```

### Process Individual User Salary
```
POST /api/admin/salaries/process/:userId
Authorization: Bearer <admin_token>

Response:
{
  "success": true,
  "message": "Salary of 15000 ETB paid successfully",
  "paid": true,
  "salary": { ... }
}
```

### Get Users with Salary Info
```
GET /api/admin/users
Authorization: Bearer <admin_token>

Response:
{
  "success": true,
  "count": 10,
  "users": [
    {
      "_id": "...",
      "phone": "+251912345678",
      "membershipLevel": "Rank 5",
      "incomeWallet": 50000,
      "personalWallet": 25000,
      "monthlySalary": 15000,  // <-- New field
      ...
    }
  ]
}
```

## Admin Features

### View Salary Information
- Navigate to **Users** page in admin panel
- See "Monthly Salary" column showing each user's calculated salary
- This shows what they would earn if paid today

### Manual Processing
1. Go to **System Settings** page
2. Find "Salary Processing" section
3. Click "Process All Salaries Now"
4. Confirm the action
5. System will process all eligible users immediately

### Monitoring
- Check console logs for daily processing status
- View Salary collection in MongoDB for payment history
- Check user's `lastSalaryDate` field to see when they were last paid

## Payment Logic

### When a User Gets Paid
1. System calculates their current referral network
2. Determines which salary tier they qualify for
3. Checks if they've already been paid this month
4. If eligible:
   - Credits their income wallet
   - Creates a Salary record
   - Updates their `lastSalaryDate`

### Duplicate Prevention
- Uses unique index on `(user, month, year)` in Salary model
- Checks `lastSalaryDate` before processing
- Ensures users are only paid once per calendar month

## Configuration

### Scheduler Settings
Located in `backend/services/salaryScheduler.js`:
```javascript
cron.schedule('1 0 * * *', ...) // Daily at 00:01 AM
timezone: "Africa/Addis_Ababa"
```

### Salary Amounts
Configured in System Settings (database):
- `salaryDirect10Threshold` & `salaryDirect10Amount`
- `salaryDirect15Threshold` & `salaryDirect15Amount`
- `salaryDirect20Threshold` & `salaryDirect20Amount`
- `salaryNetwork40Threshold` & `salaryNetwork40Amount`

## Testing

### Test Automatic Processing
```bash
# In backend directory
node -e "require('./services/salaryScheduler').processAllSalaries()"
```

### Test Individual User
```bash
# Replace USER_ID with actual user ID
curl -X POST http://localhost:5000/api/admin/salaries/process/USER_ID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Troubleshooting

### Salaries Not Processing
1. Check if scheduler initialized: Look for log message on server start
2. Verify MongoDB connection is active
3. Check server timezone settings
4. Review console logs for errors

### User Not Getting Paid
1. Verify user meets salary requirements (check referral count)
2. Check if user already paid this month (query Salary collection)
3. Ensure user is active (`isActive: true`)
4. Verify referrals are not "Intern" level

### Duplicate Payments
- Should not happen due to unique index
- If occurs, check database for duplicate Salary records
- Verify `lastSalaryDate` is being updated correctly

## Future Enhancements
- Email notifications when salary is paid
- Salary history view in admin panel
- Detailed salary breakdown in user profile
- Configurable payment schedules (weekly, bi-weekly, etc.)
- Salary projections and forecasting
