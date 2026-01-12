# API Configuration Guide

## Overview

Both the client and admin frontends now use a centralized API configuration system. All backend URL references are managed in one place, making it easy to update the API endpoint across the entire application.

## Configuration Files

### Client
- **Config File**: `client/src/config/api.config.js`
- **API Service**: `client/src/services/api.js`

### Admin
- **Config File**: `admin/src/config/api.config.js`
- **API Service**: `admin/src/services/api.js`

## How It Works

### 1. Central Configuration (`api.config.js`)

```javascript
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5002/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Get the base API URL (with /api)
export const getApiUrl = () => API_CONFIG.baseURL;

// Get the server base URL (without /api) - for uploaded files, images, etc.
export const getServerUrl = () => API_CONFIG.baseURL.replace(/\/api$/, '');
```

### 2. API Service (`api.js`)

The main API service imports and uses the centralized config:

```javascript
import API_CONFIG from '../config/api.config';

const api = axios.create({
    baseURL: API_CONFIG.baseURL,
    timeout: API_CONFIG.timeout,
    headers: API_CONFIG.headers,
});
```

### 3. Usage in Components

For most API calls, use the exported API functions from `services/api.js`:

```javascript
import { userAPI, depositAPI } from '../services/api';

// Use the API functions
const response = await userAPI.getProfile();
const deposits = await depositAPI.getUserDeposits();
```

For direct fetch calls or accessing uploaded files:

```javascript
import { getApiUrl, getServerUrl } from '../config/api.config';

// For API calls
const response = await fetch(`${getApiUrl()}/slot-tiers`);

// For accessing uploaded images/files
const imageUrl = `${getServerUrl()}${user.profilePhoto}`;
```

## Environment Variables

Both applications read the API URL from the `.env` file:

```env
VITE_API_URL=http://localhost:5002/api
```

To change the backend URL:
1. Update the `.env` file in `client/` or `admin/`
2. Restart the development server

## Benefits

✅ **Single Source of Truth**: Change the API URL in one place  
✅ **Easy Maintenance**: No more hunting for hardcoded URLs  
✅ **Environment Flexibility**: Easily switch between dev/staging/production  
✅ **Type Safety**: Centralized configuration reduces typos  
✅ **Consistent Timeout**: All requests use the same timeout setting  

## Migration Complete

All hardcoded URLs have been replaced with the centralized configuration in:

### Client
- `src/App.jsx`
- `src/pages/Team.jsx`
- `src/pages/Settings.jsx`
- `src/pages/Mine.jsx`
- `src/pages/SpinWheel.jsx`
- `src/services/api.js`

### Admin
- `src/pages/Users.jsx`
- `src/pages/SlotMachine.jsx`
- `src/pages/SystemSettings.jsx`
- `src/services/api.js`

## Best Practices

1. **Always use the API service functions** when possible
2. **Import from config** when you need direct fetch calls
3. **Never hardcode URLs** in components
4. **Use `getServerUrl()`** for accessing uploaded files/images
5. **Use `getApiUrl()`** for direct API fetch calls
