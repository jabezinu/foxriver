# Admin UI Preview - Rank Progression Restrictions

## Page Layout

The Membership Management page now has three main sections:

### 1. Rank Progression Restrictions Section (NEW)
Located at the top of the page with a blue left border for emphasis.

```
┌─────────────────────────────────────────────────────────────┐
│ 🔒 Rank Progression Restrictions                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ℹ️ How it works:                                            │
│ • By default, users can skip ranks freely                   │
│ • Set a restricted range to require sequential progression  │
│ • Example: If you set Rank 7-10 as restricted, users must   │
│   progress 7→8→9→10                                         │
│ • Outside the restricted range, users can still skip ranks  │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ ✅ No Restrictions Active                             │   │
│ │ Users can skip ranks freely                           │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ Restriction Start Rank    Restriction End Rank              │
│ [Select start rank ▼]     [Select end rank ▼]              │
│                                                              │
│ [🔒 Set Restriction]                                        │
└─────────────────────────────────────────────────────────────┘
```

**When a restriction is active:**
```
┌─────────────────────────────────────────────────────────────┐
│ ⚠️ Active Restriction                                       │
│ Sequential progression required from Rank 7 to Rank 10      │
│                                           [🔓 Clear Restriction] │
└─────────────────────────────────────────────────────────────┘
```

### 2. Hide/Unhide by Rank Range Section
The existing functionality for hiding/showing membership tiers.

```
┌─────────────────────────────────────────────────────────────┐
│ Hide/Unhide by Rank Range                                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Start Rank              End Rank                             │
│ [Select start rank ▼]   [Select end rank ▼]                │
│                                                              │
│ [👁️‍🗨️ Hide Selected Range]  [👁️ Unhide Selected Range]      │
└─────────────────────────────────────────────────────────────┘
```

### 3. All Membership Tiers Table
Shows all membership levels with their details.

```
┌─────────────────────────────────────────────────────────────┐
│ All Membership Tiers                                        │
├─────────────────────────────────────────────────────────────┤
│ Level    │ Price      │ Daily Income │ Per Video │ Status   │
├──────────┼────────────┼──────────────┼───────────┼──────────┤
│ Intern   │ 0 ETB      │ 50.00 ETB    │ 10.00 ETB │ 👁️ Visible│
│ Rank 1   │ 1,500 ETB  │ 50.00 ETB    │ 10.00 ETB │ 👁️ Visible│
│ Rank 2   │ 3,000 ETB  │ 100.00 ETB   │ 20.00 ETB │ 👁️ Visible│
│ Rank 3   │ 6,000 ETB  │ 200.00 ETB   │ 40.00 ETB │ 👁️‍🗨️ Hidden│
│ ...      │ ...        │ ...          │ ...       │ ...      │
└─────────────────────────────────────────────────────────────┘
```

## Color Scheme

### Status Indicators
- **Green Box** (No restrictions): `bg-green-50 border-green-200 text-green-800`
- **Yellow Box** (Active restriction): `bg-yellow-50 border-yellow-200 text-yellow-800`
- **Blue Box** (Information): `bg-blue-50 border-blue-200 text-blue-800`

### Buttons
- **Primary Button** (Set/Update): Indigo background `bg-indigo-600 hover:bg-indigo-700`
- **Danger Button** (Clear): Red background `bg-red-600 hover:bg-red-700`
- **Secondary Button** (Unhide): Gray background `bg-gray-100 hover:bg-gray-200`

### Icons
- 🔒 Lock (Restriction active/being set)
- 🔓 Unlock (No restrictions/clearing)
- ⚠️ Alert Circle (Information)
- 👁️ Eye (Visible)
- 👁️‍🗨️ Eye Off (Hidden)

## User Interactions

### Setting a Restriction
1. Admin selects "Rank 7" from first dropdown
2. Admin selects "Rank 10" from second dropdown
3. Admin clicks "Set Restriction" button
4. System validates (must be at least 2 ranks)
5. Success message appears
6. Status box changes from green to yellow
7. "Clear Restriction" button appears

### Clearing a Restriction
1. Admin clicks "Clear Restriction" button
2. Confirmation dialog appears: "Are you sure you want to clear rank progression restrictions?"
3. Admin confirms
4. Success message appears
5. Status box changes from yellow to green
6. Dropdowns reset

### Validation Messages
- "Please select both start and end ranks for restriction"
- "Start rank must be less than or equal to end rank"
- "Restricted range must include at least 2 ranks"
- "Sequential progression is now required from Rank X to Rank Y"
- "Rank progression restrictions have been cleared"

## Responsive Design

### Desktop (>768px)
- Dropdowns side by side in 2-column grid
- Buttons displayed horizontally
- Full table visible

### Mobile (<768px)
- Dropdowns stack vertically
- Buttons stack vertically
- Table scrolls horizontally

## Accessibility Features

- All buttons have descriptive text and icons
- Color is not the only indicator (icons + text)
- Proper focus states on all interactive elements
- Clear error messages
- Confirmation dialogs for destructive actions
- Loading states prevent double-clicks

## Loading States

### During API Calls
- Buttons show disabled state (opacity-50)
- Cursor changes to not-allowed
- Prevents multiple submissions
- Spinners can be added if needed

### Error Handling
- Alert dialogs show error messages
- Console logs for debugging
- User-friendly error messages
- No technical jargon in user-facing messages

## Example Workflows

### Workflow 1: First Time Setup
1. Admin opens Membership Management
2. Sees green "No Restrictions Active" box
3. Reads the blue information box
4. Selects Rank 7 and Rank 10
5. Clicks "Set Restriction"
6. Sees yellow "Active Restriction" box
7. Users now must progress 7→8→9→10 sequentially

### Workflow 2: Changing Restriction
1. Admin sees yellow box showing "Rank 7 to Rank 10"
2. Wants to change to "Rank 5 to Rank 8"
3. Selects Rank 5 and Rank 8 in dropdowns
4. Clicks "Update Restriction"
5. Yellow box updates to show new range
6. Old restriction is replaced

### Workflow 3: Removing Restriction
1. Admin sees yellow box with active restriction
2. Clicks "Clear Restriction" button
3. Confirms in dialog
4. Yellow box changes to green
5. Users can now skip ranks freely

## Tips for Admins

1. **Test Before Deploying**: Set a restriction in a test environment first
2. **Communicate Changes**: Inform users when restrictions change
3. **Monitor Impact**: Watch for user feedback after setting restrictions
4. **Use Wisely**: Don't over-restrict - it may frustrate users
5. **Document Reasons**: Keep notes on why you set specific restrictions
