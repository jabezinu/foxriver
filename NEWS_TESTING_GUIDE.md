# News System Testing Guide

## Quick Start Testing

### Prerequisites
- Backend server running on configured port
- Admin panel running
- Client app running
- At least one admin user account
- At least one regular user account

## Step-by-Step Testing

### Part 1: Admin Panel - Create Popup News

1. **Login to Admin Panel**
   - Navigate to admin panel URL
   - Login with admin credentials

2. **Create News with Popup**
   - Click on "News Management" in sidebar
   - Click "Create News" button
   - Fill in the form:
     - Title: "Welcome to FoxRiver!"
     - Content: "We're excited to announce new features and improvements to our platform. Stay tuned for more updates!"
     - ✅ Check "Show as popup notification when users sign in"
   - Click "Create News"
   - Verify success message appears
   - Verify news appears in the list with "Popup: Enabled" badge

3. **Create Regular News (No Popup)**
   - Click "Create News" again
   - Fill in the form:
     - Title: "Platform Maintenance Schedule"
     - Content: "Scheduled maintenance will occur on Sunday from 2 AM to 4 AM."
     - ⬜ Leave "Show as popup notification" unchecked
   - Click "Create News"
   - Verify news appears without popup badge

### Part 2: Client Side - Test Popup on Login

1. **Test Fresh Login**
   - Open client app in browser (or incognito mode)
   - Login with regular user credentials
   - **Expected Result**: Popup should appear immediately after login with "Welcome to FoxRiver!" news
   - Verify popup displays:
     - Title
     - Published date
     - Content
     - "Official News" badge
     - Close button

2. **Close Popup**
   - Click the "Close" button or X icon
   - **Expected Result**: Popup disappears
   - Navigate around the app
   - **Expected Result**: Popup should NOT reappear

3. **Test News Page**
   - Navigate to News page (from menu)
   - **Expected Result**: Both news items should be visible in the list
   - Click on "Welcome to FoxRiver!" news
   - **Expected Result**: Full news details appear in modal
   - Verify content matches the popup content
   - Close the modal

### Part 3: Test Registration Flow

1. **Register New User**
   - Logout from current account
   - Click "Register"
   - Fill in registration form with new user details
   - Submit registration
   - **Expected Result**: After successful registration, popup should appear with latest news

### Part 4: Admin Panel - Edit News

1. **Disable Popup for Existing News**
   - Go back to admin panel
   - Find "Welcome to FoxRiver!" news
   - Click edit button
   - ⬜ Uncheck "Show as popup notification"
   - Click "Update News"
   - Verify "Popup: Enabled" badge is removed

2. **Enable Popup for Different News**
   - Find "Platform Maintenance Schedule" news
   - Click edit button
   - ✅ Check "Show as popup notification"
   - Click "Update News"
   - Verify "Popup: Enabled" badge appears

3. **Test Updated Popup**
   - Logout from client app
   - Login again
   - **Expected Result**: Popup should now show "Platform Maintenance Schedule" instead

### Part 5: Edge Cases

1. **No Popup News**
   - In admin panel, disable popup for all news items
   - Logout and login to client app
   - **Expected Result**: No popup should appear

2. **Multiple Popup News**
   - Enable popup for multiple news items
   - Logout and login to client app
   - **Expected Result**: Only the LATEST news (by publishedDate) should appear

3. **Inactive News with Popup**
   - Create news with popup enabled
   - Set status to "inactive"
   - Logout and login to client app
   - **Expected Result**: Inactive news should NOT appear as popup

4. **Already Logged In**
   - Keep user logged in
   - Refresh the page
   - **Expected Result**: Popup should NOT appear on refresh

## API Testing (Optional)

### Test Popup Endpoint Directly

```bash
# Get popup news
curl http://localhost:5000/api/news/popup

# Expected Response:
{
  "success": true,
  "news": {
    "_id": "...",
    "title": "Welcome to FoxRiver!",
    "content": "...",
    "showAsPopup": true,
    "status": "active",
    "publishedDate": "2026-01-10T...",
    ...
  }
}

# When no popup news exists:
{
  "success": true,
  "news": null
}
```

### Test All News Endpoint

```bash
# Get all active news
curl http://localhost:5000/api/news

# Expected Response:
{
  "success": true,
  "count": 2,
  "news": [
    { "title": "...", "showAsPopup": true, ... },
    { "title": "...", "showAsPopup": false, ... }
  ]
}
```

## Common Issues & Solutions

### Issue: Popup doesn't appear on login
**Solutions:**
- Check browser console for errors
- Verify news has `status: 'active'` and `showAsPopup: true`
- Check network tab to see if `/api/news/popup` is called
- Verify backend is running and accessible

### Issue: Popup appears on every page refresh
**Solutions:**
- Check authStore logic - `shouldShowNewsPopup` should only be true after login/register
- Verify `hideNewsPopup()` is called when popup is closed

### Issue: Wrong news appears in popup
**Solutions:**
- Check publishedDate - latest news should appear
- Verify only one news has `showAsPopup: true` and `status: 'active'`
- Check backend query in `getPopupNews` controller

### Issue: Admin checkbox doesn't save
**Solutions:**
- Check browser console for errors
- Verify formData includes `showAsPopup` field
- Check network request payload
- Verify backend controller handles `showAsPopup` in update

## Success Criteria

✅ Admin can create news with popup enabled
✅ Admin can edit news to toggle popup on/off
✅ Popup appears automatically on user login
✅ Popup appears automatically on user registration
✅ Popup shows latest active news with popup flag
✅ Popup can be closed and doesn't reappear
✅ Same news content visible on News page
✅ Multiple news items display correctly on News page
✅ Popup doesn't appear when no popup news exists
✅ Popup doesn't appear on page refresh

## Performance Notes

- Popup news fetch happens after authentication
- Only one API call per login/register
- News list on News page fetches all active news
- No polling or real-time updates (by design)

## Browser Compatibility

Tested and working on:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Next Steps After Testing

1. Monitor user feedback on popup frequency
2. Consider implementing "Don't show again" option
3. Track which news items get the most views
4. Consider adding analytics for popup engagement
5. Implement user-specific tracking to avoid showing same news repeatedly
