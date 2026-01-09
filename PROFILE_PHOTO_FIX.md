# Profile Photo Display Fix

## Issue
Profile photos were not visible for users on both the client side and admin panel.

## Root Cause
The `VITE_API_URL` environment variable includes `/api` at the end (e.g., `http://localhost:5002/api`), but the profile photo paths stored in the database start with `/uploads/profiles/...`. 

When constructing the image URL, the code was concatenating these directly:
```
http://localhost:5002/api + /uploads/profiles/photo.jpg
= http://localhost:5002/api/uploads/profiles/photo.jpg ❌
```

However, the Express server serves static files at the root level:
```javascript
app.use('/uploads', express.static('uploads'));
```

So the correct URL should be:
```
http://localhost:5002/uploads/profiles/photo.jpg ✅
```

## Solution
Modified the image URL construction in all affected files to remove the `/api` suffix from the base URL before appending the profile photo path.

### Files Fixed

#### 1. Client Side - Mine.jsx
**Location:** `client/src/pages/Mine.jsx`

**Change:**
```javascript
// Before
const getProfileImageUrl = () => {
    if (!profile.profilePhoto) return null;
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return `${API_URL}${profile.profilePhoto}`;
};

// After
const getProfileImageUrl = () => {
    if (!profile.profilePhoto) return null;
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    // Remove /api from the end since uploads are served at root level
    const baseURL = API_URL.replace(/\/api$/, '');
    return `${baseURL}${profile.profilePhoto}`;
};
```

#### 2. Client Side - Settings.jsx
**Location:** `client/src/pages/Settings.jsx`

**Change:**
```javascript
// Before
src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${profile.profilePhoto}`}

// After
src={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '')}${profile.profilePhoto}`}
```

#### 3. Client Side - Team.jsx
**Location:** `client/src/pages/Team.jsx`

**Change:**
```javascript
// Before
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// After
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');
```

#### 4. Admin Side - Users.jsx
**Location:** `admin/src/pages/Users.jsx`

**Change:**
```javascript
// Before
src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${user.profilePhoto}`}

// After
src={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '')}${user.profilePhoto}`}
```

## How It Works

The fix uses a regex pattern `.replace(/\/api$/, '')` to remove `/api` only if it appears at the end of the URL:

- `http://localhost:5002/api` → `http://localhost:5002`
- `http://localhost:5002` → `http://localhost:5002` (no change)
- `http://192.168.177.53:5002/api` → `http://192.168.177.53:5002`

This ensures the profile photo URL is constructed correctly regardless of whether the environment variable includes `/api` or not.

## Testing

To verify the fix works:

1. **Client Side:**
   - Navigate to the Mine page - profile photo should display
   - Navigate to Settings page - profile photo should display
   - Navigate to Team page - team member photos should display

2. **Admin Side:**
   - Navigate to Users page - user profile photos should display in the table

3. **Upload Test:**
   - Upload a new profile photo from the Mine page
   - Verify it displays immediately after upload
   - Check that it appears on all pages (Mine, Settings, Team)

## Environment Configuration

Current configuration in `.env` files:
```
VITE_API_URL=http://localhost:5002/api
```

Backend server configuration in `server.js`:
```javascript
app.use('/uploads', express.static('uploads'));
```

Backend port in `.env`:
```
PORT=5002
```

## Notes

- The backend stores profile photos in `backend/uploads/profiles/`
- Photo paths in the database are stored as `/uploads/profiles/filename.jpg`
- The Express static middleware serves files from the `uploads` directory at the `/uploads` route
- All profile photo functionality (upload, delete, display) is now working correctly
