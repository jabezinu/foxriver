# News System - Quick Reference Card

## 🚀 Quick Start

### Create Popup News (Admin)
1. Login to admin panel
2. News Management → Create News
3. Fill title and content
4. ✅ Check "Show as popup notification"
5. Submit

### View Popup (User)
1. Login or register
2. Popup appears automatically
3. Read and close

## 📍 Key Locations

### Backend
- **Model**: `backend/models/News.js`
- **Controller**: `backend/controllers/newsController.js`
- **Routes**: `backend/routes/news.js`

### Admin Panel
- **Page**: `admin/src/pages/News.jsx`

### Client
- **Popup Component**: `client/src/components/NewsPopup.jsx`
- **App Logic**: `client/src/App.jsx`
- **State Management**: `client/src/store/authStore.js`
- **API Service**: `client/src/services/api.js`
- **News Page**: `client/src/pages/CompanyNews.jsx`

## 🔌 API Endpoints

```
GET  /api/news          - Get all active news
GET  /api/news/popup    - Get latest popup news
POST /api/news          - Create news (admin)
PUT  /api/news/:id      - Update news (admin)
DELETE /api/news/:id    - Delete news (admin)
```

## 💾 Database Schema

```javascript
{
  title: String,           // Required
  content: String,         // Required
  imageUrl: String,        // Optional
  status: String,          // 'active' | 'inactive'
  showAsPopup: Boolean,    // Default: false
  publishedDate: Date,     // Default: now
  createdBy: ObjectId      // Admin user
}
```

## 🎯 State Management

### Auth Store States
```javascript
shouldShowNewsPopup: Boolean  // Trigger popup display
latestNews: Object           // News data to display
```

### Auth Store Actions
```javascript
setLatestNews(news)    // Set news data
hideNewsPopup()        // Dismiss popup
```

## 🔄 User Flow

```
Login/Register
    ↓
shouldShowNewsPopup = true
    ↓
Fetch /api/news/popup
    ↓
Display NewsPopup
    ↓
User closes popup
    ↓
hideNewsPopup()
    ↓
shouldShowNewsPopup = false
```

## ⚡ Quick Commands

### Test Popup Endpoint
```bash
curl http://localhost:5000/api/news/popup
```

### Test All News
```bash
curl http://localhost:5000/api/news
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Popup not showing | Check news has `showAsPopup: true` and `status: 'active'` |
| Popup shows on refresh | Check `shouldShowNewsPopup` only set on login/register |
| Wrong news in popup | Verify latest news by `publishedDate` |
| Admin checkbox not saving | Check formData includes `showAsPopup` field |

## ✅ Testing Checklist

- [ ] Create news with popup enabled
- [ ] Login and see popup
- [ ] Close popup
- [ ] Check News page
- [ ] Edit news to disable popup
- [ ] Login again (no popup)
- [ ] Enable popup on different news
- [ ] Login again (new popup)

## 📚 Full Documentation

- **Technical**: `NEWS_SYSTEM_IMPLEMENTATION.md`
- **Testing**: `NEWS_TESTING_GUIDE.md`
- **Summary**: `NEWS_FEATURE_SUMMARY.md`

## 🎨 Component Props

### NewsPopup
```jsx
<NewsPopup 
  news={newsObject}    // News data
  onClose={handler}    // Close callback
/>
```

## 🔐 Access Control

- **Public**: View news, get popup news
- **Admin Only**: Create, update, delete news

## 💡 Pro Tips

1. Only one news should have popup enabled at a time
2. Use clear, concise titles for popups
3. Keep popup content brief (users can read full on News page)
4. Test popup on mobile devices
5. Monitor user feedback on popup frequency

## 🎯 Best Practices

### For Admins
- Enable popup only for important announcements
- Keep popup content under 200 words
- Use descriptive titles
- Disable popup after announcement period

### For Developers
- Always check `shouldShowNewsPopup` before fetching
- Reset popup state on logout
- Handle null/undefined news gracefully
- Test edge cases (no news, multiple news, etc.)

## 📊 Monitoring

Watch for:
- Popup display rate
- User engagement (time to close)
- News page visits
- API response times

## 🚨 Common Mistakes

❌ Enabling popup for multiple news
✅ Enable popup for one important news at a time

❌ Showing popup on every page load
✅ Show popup only on login/register

❌ Not testing on mobile
✅ Always test responsive design

❌ Forgetting to disable old popup news
✅ Disable popup when announcement period ends

## 🎉 Success Metrics

- ✅ Popup appears within 1 second of login
- ✅ No console errors
- ✅ Smooth animations
- ✅ Mobile responsive
- ✅ Accessible close actions
- ✅ Same content on News page

---

**Last Updated**: January 10, 2026
**Version**: 1.0.0
**Status**: ✅ Production Ready
