# Quick Reference - Current Task System

## System Configuration

### Task Schedule
- **Daily Tasks**: 4 videos per day
- **Working Days**: Monday - Saturday (26 days/month)
- **Rest Day**: Sunday (no tasks available)

### Earning Formula

```
Daily Income = Membership Price ÷ 26 days
Per Video Income = Daily Income ÷ 4 videos
Monthly Income = Daily Income × 26 working days
```

## Current Earnings Table

| Rank | Price | Daily | Per Video | Monthly |
|------|-------|-------|-----------|---------|
| Intern | 0 ETB | 50 ETB | 12.5 ETB | 1,300 ETB |
| Rank 1 | 3,300 ETB | 126.92 ETB | 31.73 ETB | 3,300 ETB |
| Rank 2 | 9,600 ETB | 369.23 ETB | 92.31 ETB | 9,600 ETB |
| Rank 3 | 27,000 ETB | 1,038.46 ETB | 259.62 ETB | 27,000 ETB |
| Rank 4 | 78,000 ETB | 3,000 ETB | 750 ETB | 78,000 ETB |
| Rank 5 | 220,000 ETB | 8,461.54 ETB | 2,115.38 ETB | 220,000 ETB |
| Rank 6 | 590,000 ETB | 22,692.31 ETB | 5,673.08 ETB | 590,000 ETB |
| Rank 7 | 1,280,000 ETB | 49,230.77 ETB | 12,307.69 ETB | 1,280,000 ETB |
| Rank 8 | 2,530,000 ETB | 97,307.69 ETB | 24,326.92 ETB | 2,530,000 ETB |
| Rank 9 | 5,000,000 ETB | 192,307.69 ETB | 48,076.92 ETB | 5,000,000 ETB |
| Rank 10 | 9,800,000 ETB | 376,923.08 ETB | 94,230.77 ETB | 9,800,000 ETB |

## Key Features

### ✅ 4 Videos Per Day
- Reduced from 5 to 4 videos
- Higher per-video earnings
- Less time commitment

### ✅ Sunday Rest Day
- No tasks on Sundays
- Automatic detection
- Friendly UI message
- Progress preserved

### ✅ 26-Day ROI
- Users break even in 26 working days
- Same monthly total as before
- Higher daily income rate

### ✅ Intern Special Rules
- Fixed 50 ETB daily income
- 12.5 ETB per video (4 videos)
- 4-day earning window
- 50 ETB daily cap
- 200 ETB lifetime cap
- Must upgrade to Rank 1 after trial

## User Experience

### Monday - Saturday
1. User logs in
2. Sees 4 available tasks
3. Watches each video for 8 seconds
4. Earns per-video income
5. Income credited to wallet
6. Referral commissions calculated

### Sunday
1. User logs in
2. Sees "Sunday Rest Day" banner
3. No tasks available
4. Encouraged to return tomorrow
5. Progress and earnings preserved

## Admin Features

### Task Management
- Upload individual videos
- Add YouTube playlists
- Sync videos from playlists
- Auto-rotation (4 random videos daily)
- Consecutive day filter

### Membership Pricing
- Update prices anytime
- Earnings auto-calculate
- Changes take effect immediately
- Intern must stay free (0 ETB)

## Technical Notes

### Sunday Detection
```javascript
const today = new Date();
const isSunday = today.getDay() === 0; // 0 = Sunday
```

### Calculation Methods
```javascript
// In Membership model
getDailyIncome() {
    if (this.level === 'Intern') return 50;
    return this.price / 26;
}

getPerVideoIncome() {
    if (this.level === 'Intern') return 12.5;
    return this.getDailyIncome() / 4;
}
```

## Benefits Summary

| Feature | Benefit |
|---------|---------|
| 4 Videos | Less time, higher per-video value |
| Sunday Off | Better work-life balance |
| 26 Days | Higher daily income rate |
| Auto-Calculate | Dynamic pricing support |
| Same Monthly | Predictable ROI |

## ROI Timeline

- **Intern**: 4 days (with restrictions)
- **All Ranks**: 26 working days (approximately 1 month)
- **Break Even**: Complete all daily tasks for 26 days
- **Profit**: Referral commissions + continued earnings

## Support

For questions about:
- **Earnings**: Check this reference guide
- **Sunday**: Tasks resume Monday
- **Intern Limits**: Upgrade to Rank 1
- **Technical Issues**: Contact admin
