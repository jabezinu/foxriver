# Membership Pricing Management - Quick Guide

## Overview
Easily update membership prices through the admin panel. All changes take effect immediately across the entire system.

## How to Update Prices

### Step-by-Step Instructions

1. **Access the Feature**
   - Log in to the admin panel
   - Navigate to **Membership Management** (shield icon in sidebar)
   - Scroll to the **All Membership Tiers** table

2. **Edit a Price**
   - Find the membership tier you want to update
   - Click the **Edit** icon (📝 blue button) in the Actions column
   - The price field becomes editable

3. **Enter New Price**
   - Type the new price in ETB
   - Price must be 0 or greater
   - Use whole numbers or decimals

4. **Save Changes**
   - Click the **Save** icon (✓ green button) to confirm
   - Or click the **Cancel** icon (✕ gray button) to discard

5. **Verify Update**
   - Success message appears
   - Table refreshes with new price
   - Daily income and per-video income automatically updated

## Visual Guide

### Before Editing
```
Level      | Price (ETB)  | Actions
-----------|--------------|----------
Rank 1     | 3,300 ETB    | [Edit 📝]
```

### During Editing
```
Level      | Price (ETB)     | Actions
-----------|-----------------|------------------
Rank 1     | [5000____]      | [Save ✓] [Cancel ✕]
```

### After Saving
```
Level      | Price (ETB)  | Actions
-----------|--------------|----------
Rank 1     | 5,000 ETB    | [Edit 📝]
```

## Important Rules

### ✅ Allowed
- Update any Rank 1-10 price
- Set prices to any positive number
- Update multiple tiers separately
- Make changes at any time

### ❌ Not Allowed
- Change Intern price (must stay 0 ETB)
- Set negative prices
- Set non-numeric values

## What Gets Updated Automatically

When you change a membership price, these values update automatically:

| Field | Calculation | Example (5,000 ETB) |
|-------|-------------|---------------------|
| **Daily Income** | Price ÷ 30 days | 166.67 ETB/day |
| **Per Video Income** | Daily Income ÷ 5 videos | 33.33 ETB/video |
| **Four-Day Income** | Daily Income × 4 days | 666.68 ETB |

## Impact on Users

### Immediate Effects
- ✅ Users see new prices when viewing membership tiers
- ✅ Upgrade costs reflect new prices
- ✅ Daily earnings calculated with new prices
- ✅ Commission calculations use new prices

### No Impact On
- ❌ Existing user membership levels (they keep their current level)
- ❌ Past transactions or earnings
- ❌ Historical data

## Common Use Cases

### 1. Price Increase
**Scenario:** Adjust for inflation or increased value
```
Rank 5: 220,000 ETB → 250,000 ETB
Result: Higher upgrade cost, higher daily income
```

### 2. Promotional Discount
**Scenario:** Limited-time offer to attract users
```
Rank 3: 27,000 ETB → 24,000 ETB (11% off)
Result: Lower upgrade cost, lower daily income
```

### 3. Market Adjustment
**Scenario:** Align with competitor pricing
```
Rank 7: 1,280,000 ETB → 1,200,000 ETB
Result: More competitive pricing
```

### 4. Tier Restructuring
**Scenario:** Rebalance entire tier system
```
Update multiple tiers to create better progression
```

## Tips & Best Practices

### 💡 Planning
- Review current prices before making changes
- Consider impact on user upgrade decisions
- Test changes in development environment first
- Communicate major price changes to users

### 💡 Timing
- Update prices during low-traffic periods
- Avoid changes during active promotions
- Schedule updates for maintenance windows
- Document all price changes

### 💡 Validation
- Double-check new prices before saving
- Verify calculations after update
- Monitor user feedback after changes
- Track upgrade rates before/after changes

## Troubleshooting

### Issue: Can't Edit Intern Price
**Solution:** This is by design. Intern membership must remain free (0 ETB).

### Issue: Save Button Disabled
**Possible Causes:**
- No changes made to price
- Invalid price entered (negative or non-numeric)
- Currently saving (wait for operation to complete)

### Issue: Changes Not Showing
**Solution:**
- Refresh the page
- Clear browser cache
- Check if save was successful (look for success message)

### Issue: Error Message Appears
**Common Errors:**
- "Price cannot be negative" → Enter a positive number
- "Intern membership must remain free" → Don't change Intern price
- "Membership level not found" → Refresh page and try again

## Quick Reference

### Keyboard Shortcuts
- **Tab** - Move to next field
- **Enter** - Save changes (when in edit mode)
- **Esc** - Cancel editing

### Status Indicators
- 🟢 **Green Save Button** - Ready to save
- 🔵 **Blue Edit Button** - Ready to edit
- ⚪ **Gray Cancel Button** - Discard changes
- 🔒 **Disabled Button** - Action not available (e.g., Intern)

### Price Ranges (Typical)
- **Rank 1-3:** 3,000 - 30,000 ETB (Entry level)
- **Rank 4-6:** 50,000 - 600,000 ETB (Mid level)
- **Rank 7-10:** 1,000,000 - 10,000,000 ETB (Premium level)

## Example Workflow

### Scenario: Update Rank 1 Price

1. **Current State**
   - Rank 1 = 3,300 ETB
   - Daily Income = 110 ETB
   - Per Video = 22 ETB

2. **Action**
   - Click Edit on Rank 1
   - Enter 5,000 ETB
   - Click Save

3. **New State**
   - Rank 1 = 5,000 ETB
   - Daily Income = 166.67 ETB
   - Per Video = 33.33 ETB

4. **Result**
   - Users pay 5,000 ETB to upgrade
   - Users earn 166.67 ETB per day
   - Users earn 33.33 ETB per video

## Need Help?

### Resources
- Full documentation: `DYNAMIC_MEMBERSHIP_PRICING.md`
- Technical details: Backend API documentation
- Support: Contact development team

### Before Contacting Support
- Note the membership level you're trying to update
- Screenshot any error messages
- Document the price you're trying to set
- Check if issue persists after page refresh

## Summary

Dynamic membership pricing gives you full control over membership costs. Update prices anytime through the admin panel, and changes take effect immediately. The system automatically recalculates all derived values, ensuring consistency across the entire application.

**Remember:** With great power comes great responsibility. Price changes affect all users, so plan carefully and communicate changes when appropriate.
