# Wealth Fund Quick Start Guide

## Setup

1. **Start Backend Server**
   ```bash
   cd backend
   npm start
   ```

2. **Start Admin Panel**
   ```bash
   cd admin
   npm run dev
   ```

3. **Start Client App**
   ```bash
   cd client
   npm run dev
   ```

## Admin: Create Your First Wealth Fund

1. Login to admin panel
2. Navigate to "Wealth Funds" in sidebar
3. Click "Add Wealth Fund"
4. Fill in the form:
   - **Name**: "Accel Partners"
   - **Image URL**: (any image URL)
   - **Duration**: 5 days
   - **Profit Type**: Percentage
   - **Daily Profit**: 1.14
   - **Minimum Deposit**: 100
   - **Description**: "Accel Partners, founded in 1983, is a well-known venture capital firm..."
   - **Active**: ✓ Checked
5. Click "Create"

## Client: Make Your First Investment

1. Login to client app
2. Navigate to "Wealth" tab (bottom navigation)
3. You should see your created fund
4. Click on the fund card
5. Enter investment amount (e.g., 500)
6. See total revenue calculated automatically
7. Click "Investment" button
8. Review funding source allocation
9. Enter your 6-digit transaction password
10. Click "Confirm Investment"
11. Success! Your wallets are updated

## Sample Wealth Funds

### Fund 1: Accel Partners
- Duration: 5 Days
- Daily Profit: 1.14%
- Minimum: 100 ETB
- Example: 1000 ETB → 1057 ETB (57 ETB profit)

### Fund 2: BNY Mellon
- Duration: 15 Days
- Daily Profit: 1.79%
- Minimum: 100 ETB
- Example: 1000 ETB → 1268.5 ETB (268.5 ETB profit)

### Fund 3: Invesco
- Duration: 30 Days
- Daily Profit: 2.68%
- Minimum: 200 ETB
- Example: 1000 ETB → 1804 ETB (804 ETB profit)

## API Testing with Postman/Thunder Client

### Get All Funds (User)
```
GET http://localhost:5000/api/wealth/funds
Headers:
  Authorization: Bearer <user_token>
```

### Create Investment
```
POST http://localhost:5000/api/wealth/invest
Headers:
  Authorization: Bearer <user_token>
  Content-Type: application/json
Body:
{
  "wealthFundId": "<fund_id>",
  "amount": 500,
  "fundingSource": {
    "incomeWallet": 300,
    "personalWallet": 200
  },
  "transactionPassword": "123456"
}
```

### Create Fund (Admin)
```
POST http://localhost:5000/api/wealth/admin/funds
Headers:
  Authorization: Bearer <admin_token>
  Content-Type: application/json
Body:
{
  "name": "Test Fund",
  "image": "https://example.com/image.jpg",
  "days": 7,
  "profitType": "percentage",
  "dailyProfit": 2.5,
  "minimumDeposit": 100,
  "description": "Test investment fund",
  "isActive": true
}
```

## Troubleshooting

### "Wealth fund not found"
- Ensure the fund is marked as "Active" in admin panel
- Check that the fund ID is correct

### "Insufficient balance"
- Verify user has enough balance in wallets
- Check both income and personal wallet totals

### "Minimum deposit is X ETB"
- Enter an amount equal to or greater than minimum
- Check the fund's minimum deposit requirement

### "Transaction password incorrect"
- Ensure user has set a transaction password
- Password must be exactly 6 digits
- Check password in user settings

## Revenue Calculation Formula

### Percentage-based:
```
Daily Profit Amount = Investment × (Daily Profit % ÷ 100)
Total Revenue = Investment + (Daily Profit Amount × Days)
```

### Fixed Amount:
```
Total Revenue = Investment + (Daily Profit × Days)
```

## Next Steps

1. Test with different investment amounts
2. Create multiple funds with varying durations
3. Test funding source combinations
4. Verify wallet balance updates
5. Check investment records in database
