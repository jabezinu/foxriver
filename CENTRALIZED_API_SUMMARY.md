# Centralized API Configuration - Summary

## What Was Done

Successfully centralized all backend API URL references in both the client and admin frontends into a single configuration file for each application.

## Changes Made

### New Files Created
1. `client/src/config/api.config.js` - Client API configuration
2. `admin/src/config/api.config.js` - Admin API configuration
3. `API_CONFIG_GUIDE.md` - Complete documentation

### Files Updated

#### Client (6 files)
- `src/services/api.js` - Updated to use centralized config
- `src/App.jsx` - Replaced hardcoded URL
- `src/pages/Team.jsx` - Replaced hardcoded URL
- `src/pages/Settings.jsx` - Replaced hardcoded URL
- `src/pages/Mine.jsx` - Replaced hardcoded URL
- `src/pages/SpinWheel.jsx` - Replaced hardcoded URL

#### Admin (4 files)
- `src/services/api.js` - Updated to use centralized config
- `src/pages/Users.jsx` - Replaced hardcoded URL
- `src/pages/SlotMachine.jsx` - Replaced hardcoded URLs (4 instances)
- `src/pages/SystemSettings.jsx` - Replaced hardcoded URLs (2 instances)

## How to Use

### For API Calls
```javascript
import { userAPI, depositAPI } from '../services/api';
const response = await userAPI.getProfile();
```

### For Direct Fetch or File URLs
```javascript
import { getApiUrl, getServerUrl } from '../config/api.config';

// API endpoint
const data = await fetch(`${getApiUrl()}/endpoint`);

// Uploaded files
const imageUrl = `${getServerUrl()}${user.profilePhoto}`;
```

### To Change Backend URL
Simply update the `.env` file:
```env
VITE_API_URL=http://your-backend-url:port/api
```

## Benefits
- ✅ Single source of truth for API URLs
- ✅ Easy to switch between environments
- ✅ No more scattered hardcoded URLs
- ✅ Consistent configuration across the app
- ✅ All files verified with no errors
