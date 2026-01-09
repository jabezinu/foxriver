# Quick Reference - Rank Progression Restrictions

## At a Glance

### What Does It Do?
Controls whether users can skip membership ranks or must progress sequentially.

### Where Is It?
**Membership Management** page → Top section with blue border

---

## Quick Actions

### ✅ Allow Free Progression (Default)
**Status:** Green box "No Restrictions Active"  
**Action:** Do nothing or click "Clear Restriction"  
**Result:** Users can skip ranks (e.g., Rank 1 → Rank 5)

### 🔒 Require Sequential Progression
**Status:** Yellow box "Active Restriction"  
**Action:** 
1. Select start rank (e.g., Rank 7)
2. Select end rank (e.g., Rank 10)
3. Click "Set Restriction"

**Result:** Users must progress 7→8→9→10 (no skipping)

### 🔄 Change Restriction
**Action:**
1. Select new start and end ranks
2. Click "Update Restriction"

**Result:** Old restriction replaced with new one

### 🔓 Remove Restriction
**Action:** Click "Clear Restriction" → Confirm  
**Result:** Users can skip ranks again

---

## Common Scenarios

| Scenario | Start Rank | End Rank | Effect |
|----------|-----------|----------|--------|
| Premium ranks only | 7 | 10 | Sequential for 7-10, free for 1-6 |
| Trial period | 1 | 3 | Sequential for 1-3, free after |
| Mid-tier control | 4 | 6 | Sequential for 4-6, free elsewhere |
| No restrictions | - | - | Free progression everywhere |

---

## Rules to Remember

✅ **Valid:**
- End rank > Start rank
- At least 2 ranks in range
- Ranks between 1-10

❌ **Invalid:**
- Start rank > End rank
- Single rank range
- Ranks outside 1-10

---

## User Impact Examples

### No Restriction Active
```
User at Rank 1 → Can upgrade to: 2, 3, 4, 5, 6, 7, 8, 9, 10 ✅
User at Rank 5 → Can upgrade to: 6, 7, 8, 9, 10 ✅
```

### Restriction: Rank 7-10
```
User at Rank 1 → Can upgrade to: 2, 3, 4, 5, 6, 7 ✅
User at Rank 6 → Can upgrade to: 7 only ✅
User at Rank 7 → Can upgrade to: 8 only ✅
User at Rank 7 → Cannot upgrade to: 9 or 10 ❌
User at Rank 8 → Can upgrade to: 9 only ✅
```

---

## Troubleshooting

### "Users can't upgrade"
→ Check if restriction is active  
→ Verify they're following sequential progression

### "Want to test changes"
→ Use test account  
→ Try upgrading with different ranks

### "Made a mistake"
→ Click "Clear Restriction"  
→ Set correct range

### "Need to communicate to users"
→ Use Messages feature  
→ Explain new progression rules

---

## Best Practices

1. ⚠️ **Communicate First** - Tell users before setting restrictions
2. 🧪 **Test First** - Try in development environment
3. 📊 **Monitor Impact** - Watch user feedback
4. 📝 **Document Why** - Keep notes on your decisions
5. 🔄 **Review Regularly** - Adjust as needed

---

## Need Help?

- **Full Guide:** `admin/RANK_PROGRESSION_ADMIN_GUIDE.md`
- **Technical Docs:** `backend/RANK_PROGRESSION_FEATURE.md`
- **Implementation:** `RANK_PROGRESSION_IMPLEMENTATION_SUMMARY.md`
