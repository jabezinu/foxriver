# Profile Photo Implementation

## Overview
Added profile photo upload functionality to the user profile system. Users can now upload, view, and delete their profile photos across the entire application.

## Backend Changes

### 1. User Model (`backend/models/User.js`)
- Added `profilePhoto` field:
  - Type: String
  - Default: null
  - Stores the relative path to the uploaded image

### 2. Upload Middleware (`backend/middlewares/upload.js`)
- Created multer configuration for handling file uploads
- Features:
  - Stores files in `backend/uploads/profiles/` directory
  - Generates unique filenames: `profile-{userId}-{timestamp}-{random}.{ext}`
  - Validates file types (jpeg, jpg, png, gif, webp)
  - Limits file size to 5MB
  - Automatically creates upload directory if it doesn't exist

### 3. User Controller (`backend/controllers/userController.js`)
Added three new functions:

#### `uploadProfilePhoto`
- Route: `POST /api/users/profile-photo`
- Accepts multipart/form-data with 'photo' field
- Deletes old profile photo if exists
- Saves new photo path to database
- Returns the new photo URL

#### `deleteProfilePhoto`
- Route: `DELETE /api/users/profile-photo`
- Removes photo file from disk
- Sets profilePhoto field to null
- Returns success message

#### Updated `updateProfile`
- Now returns profilePhoto in response

### 4. User Routes (`backend/routes/user.js`)
- Added `POST /api/users/profile-photo` with multer middleware
- Added `DELETE /api/users/profile-photo`

### 5. Referral Controller (`backend/controllers/referralController.js`)
- Updated queries to include `profilePhoto` field:
  - `getDownline` - includes profilePhoto for A/B/C level users
  - `getCommissions` - populates profilePhoto in downline user data

### 6. Server Configuration (`backend/server.js`)
- Already configured to serve static files from `/uploads` directory

## Frontend Changes

### 1. Client API Service (`client/src/services/api.js`)
Added methods:
- `uploadProfilePhoto(formData)` - Upload photo with multipart/form-data
- `deleteProfilePhoto()` - Delete current photo

### 2. Mine Page (`client/src/pages/Mine.jsx`)
Enhanced profile card with:
- Profile photo display (or gradient avatar fallback)
- Camera button overlay for photo upload
- File input with validation (type and size)
- Delete button (shown only when photo exists)
- Upload progress indicator
- Image preview from server

Features:
- Click camera icon to upload new photo
- Validates file type (images only)
- Validates file size (max 5MB)
- Shows loading spinner during upload
- Confirmation dialog before deletion

### 3. Settings Page (`client/src/pages/Settings.jsx`)
- Updated user card to display profile photo
- Falls back to gradient avatar if no photo

### 4. Team Page (`client/src/pages/Team.jsx`)
- Updated referral lists to show profile photos
- Displays photos for A/B/C level team members
- Falls back to gradient avatar with initials

### 5. Admin Users Page (`admin/src/pages/Users.jsx`)
- Updated users table to display profile photos
- Shows photo in user identification column
- Falls back to gradient avatar if no photo

## File Structure

```
backend/
├── uploads/
│   └── profiles/          # Profile photos stored here
│       └── profile-{userId}-{timestamp}-{random}.{ext}
├── middlewares/
│   └── upload.js          # Multer configuration
├── models/
│   └── User.js            # Added profilePhoto field
├── controllers/
│   └── userController.js  # Photo upload/delete handlers
└── routes/
    └── user.js            # Photo endpoints
```

## API Endpoints

### Upload Profile Photo
```
POST /api/users/profile-photo
Authorization: Bearer {token}
Content-Type: multipart/form-data

Body:
- photo: File (image file)

Response:
{
  "success": true,
  "message": "Profile photo uploaded successfully",
  "profilePhoto": "/uploads/profiles/profile-123-1234567890-123456789.jpg"
}
```

### Delete Profile Photo
```
DELETE /api/users/profile-photo
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Profile photo deleted successfully"
}
```

### Get Profile (Updated)
```
GET /api/users/profile
Authorization: Bearer {token}

Response includes:
{
  "success": true,
  "user": {
    ...
    "profilePhoto": "/uploads/profiles/profile-123-1234567890-123456789.jpg"
  }
}
```

## Image Handling

### Upload Process
1. User selects image file
2. Frontend validates file type and size
3. Creates FormData with file
4. Sends POST request with multipart/form-data
5. Backend validates file again
6. Deletes old photo if exists
7. Saves new photo with unique filename
8. Updates database with photo path
9. Returns photo URL to frontend

### Display Process
1. Frontend receives photo path from API
2. Constructs full URL: `{API_URL}{profilePhoto}`
3. Displays image in `<img>` tag
4. Falls back to gradient avatar if no photo

### Delete Process
1. User confirms deletion
2. Frontend sends DELETE request
3. Backend removes file from disk
4. Updates database (sets profilePhoto to null)
5. Frontend refreshes profile data

## Validation

### Frontend Validation
- File type: Must be an image (checked via MIME type)
- File size: Maximum 5MB
- User confirmation before deletion

### Backend Validation
- File type: jpeg, jpg, png, gif, webp only
- File size: Maximum 5MB (enforced by multer)
- Authentication: User must be logged in

## Features

✅ Upload profile photos (max 5MB)
✅ Supported formats: JPEG, JPG, PNG, GIF, WEBP
✅ Automatic old photo deletion on new upload
✅ Manual photo deletion option
✅ Display across all pages (Mine, Settings, Team, Admin)
✅ Fallback to gradient avatars with initials
✅ Unique filename generation
✅ File validation (type and size)
✅ Loading states during upload
✅ Error handling and user feedback
✅ Secure file storage
✅ Static file serving

## Security Considerations

1. **File Type Validation**: Only image files allowed
2. **File Size Limit**: 5MB maximum to prevent abuse
3. **Authentication Required**: All endpoints protected
4. **Unique Filenames**: Prevents file conflicts and overwrites
5. **Path Sanitization**: Multer handles secure file paths
6. **Old File Cleanup**: Removes unused files to save space

## User Experience

### Upload Flow
1. Navigate to Mine page
2. Click camera icon on profile picture
3. Select image from device
4. Image uploads automatically
5. Profile updates with new photo
6. Photo appears across all pages

### Delete Flow
1. Navigate to Mine page
2. Click trash icon (visible when photo exists)
3. Confirm deletion
4. Photo removed
5. Reverts to gradient avatar

## Testing Recommendations

1. **Upload Tests**:
   - Upload valid image (JPEG, PNG, etc.)
   - Try uploading non-image file (should fail)
   - Try uploading large file >5MB (should fail)
   - Upload multiple times (old photo should be deleted)

2. **Display Tests**:
   - Verify photo shows on Mine page
   - Verify photo shows on Settings page
   - Verify photo shows in Team referral lists
   - Verify photo shows in Admin users table
   - Check fallback avatar when no photo

3. **Delete Tests**:
   - Delete photo and verify removal
   - Check file is deleted from disk
   - Verify avatar fallback appears

4. **Edge Cases**:
   - User without photo (should show avatar)
   - Network error during upload
   - Invalid file format
   - File too large

## Notes

- Photos are stored in `backend/uploads/profiles/` directory
- Directory is automatically created if it doesn't exist
- Old photos are automatically deleted when uploading new ones
- Photos are served as static files via Express
- Full image URL is constructed on frontend using API_URL
- Gradient avatars with user initials serve as fallback
- Profile photos are included in all user queries for consistency
