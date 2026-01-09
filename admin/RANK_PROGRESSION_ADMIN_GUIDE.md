# Admin Guide: Rank Progression Restrictions

## Overview
The Membership Management page now includes a powerful feature to control how users progress through membership ranks.

## Accessing the Feature
1. Log in to the admin panel
2. Navigate to **Membership Management** from the sidebar
3. Look for the **Rank Progression Restrictions** section at the top

## Understanding the Feature

### Default Behavior (No Restrictions)
- Users can skip ranks freely
- Example: A user at Rank 1 can directly upgrade to Rank 5
- This is the default state when no restrictions are set

### With Restrictions Active
- Users must progress sequentially within the restricted range
- Example: If you set Rank 7-10 as restricted:
  - User at Rank 7 → Must upgrade to Rank 8 (cannot skip to 9 or 10)
  - User at Rank 8 → Must upgrade to Rank 9
  - User at Rank 9 → Must upgrade to Rank 10
- Outside the restricted range, users can still skip ranks

## How to Use

### Setting a Restriction
1. In the **Rank Progression Restrictions** section
2. Select **Restriction Start Rank** (e.g., Rank 7)
3. Select **Restriction End Rank** (e.g., Rank 10)
4. Click **Set Restriction** button
5. Confirmation message will appear

**Requirements:**
- End rank must be higher than start rank
- Range must include at least 2 ranks
- Only one restriction can be active at a time

### Viewing Current Restriction
- If a restriction is active, you'll see a yellow box showing:
  - "Active Restriction"
  - The current restricted range (e.g., "Rank 7 to Rank 10")
- If no restriction is active, you'll see a green box:
  - "No Restrictions Active"
  - "Users can skip ranks freely"

### Updating a Restriction
1. Simply set a new restriction using the dropdowns
2. Click **Update Restriction**
3. The old restriction will be replaced with the new one

### Clearing a Restriction
1. Click the **Clear Restriction** button in the yellow status box
2. Confirm the action
3. All restrictions will be removed
4. Users can now skip ranks freely again

## Use Cases

### Example 1: Premium Ranks Only
**Scenario:** You want users to progress freely through lower ranks, but require sequential progression for premium ranks.

**Setup:**
- Set restriction: Rank 7 to Rank 10
- Result:
  - Ranks 1-6: Users can skip freely
  - Ranks 7-10: Must progress sequentially
  - Users can jump from Rank 3 to Rank 7, but then must go 7→8→9→10

### Example 2: Trial Period
**Scenario:** You want new users to experience each early rank before jumping ahead.

**Setup:**
- Set restriction: Rank 1 to Rank 3
- Result:
  - Users must progress 1→2→3 sequentially
  - After Rank 3, they can skip to any higher rank

### Example 3: No Restrictions
**Scenario:** You want maximum flexibility for all users.

**Setup:**
- Clear any existing restrictions
- Result:
  - Users can upgrade from any rank to any higher rank

## Visual Indicators

### Status Colors
- 🟢 **Green Box**: No restrictions active
- 🟡 **Yellow Box**: Restriction is active
- 🔵 **Blue Info Box**: Explains how the feature works

### Icons
- 🔒 **Lock Icon**: Indicates restriction is active or being set
- 🔓 **Unlock Icon**: Indicates no restrictions or clearing action
- ⚠️ **Alert Icon**: Information or warning messages

## Important Notes

1. **System-Wide Effect**: Restrictions apply to all users in the system
2. **Immediate Effect**: Changes take effect immediately for all future upgrades
3. **No Retroactive Effect**: Existing user ranks are not affected
4. **Single Range**: Only one restricted range can be active at a time
5. **Validation**: The system prevents invalid configurations (e.g., start > end)

## Troubleshooting

### Users Report They Can't Upgrade
- Check if a restriction is active
- Verify the user's current rank and target rank
- Ensure they're following the sequential progression within the restricted range

### Want to Change Restriction
- You can update the restriction at any time
- Or clear it completely and set a new one

### Accidentally Set Wrong Range
- Simply click **Clear Restriction**
- Then set the correct range

## Best Practices

1. **Communicate Changes**: Inform users when you set or change restrictions
2. **Test First**: Consider the impact on user experience before setting restrictions
3. **Monitor Feedback**: Watch for user confusion or complaints after changes
4. **Document Reasons**: Keep track of why you set specific restrictions
5. **Review Regularly**: Periodically review if restrictions are still needed

## Technical Details

- Restrictions are stored in the database
- Validation happens on both frontend and backend
- Users receive clear error messages if they try to skip restricted ranks
- The system automatically checks restrictions during membership upgrades
