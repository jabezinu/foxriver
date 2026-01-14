# Known Issues & Technical Debt

## 1. Deprecated ytpl Package ⚠️

**Status**: Active Issue  
**Priority**: Medium  
**Impact**: YouTube playlist sync functionality

### Description
The `ytpl` package (v2.3.0) used for YouTube playlist parsing is deprecated and no longer supported by its maintainer.

### Current Usage
- Used in `controllers/taskController.js`
- Powers the playlist management features:
  - Adding YouTube playlists
  - Syncing videos from playlists
  - Auto-generating daily tasks from video pool

### Affected Endpoints
- `POST /api/tasks/playlists` - Add playlist
- `GET /api/tasks/playlists` - List playlists
- `DELETE /api/tasks/playlists/:id` - Delete playlist
- `POST /api/tasks/playlists/sync` - Sync videos

### Recommended Solutions

#### Option 1: YouTube Data API v3 (Recommended)
**Pros:**
- Official Google API
- Well-maintained and supported
- More features and reliability
- Better rate limiting control

**Cons:**
- Requires API key (free tier: 10,000 units/day)
- Slightly more complex setup

**Implementation:**
```bash
npm install googleapis
```

```javascript
const { google } = require('googleapis');
const youtube = google.youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_API_KEY
});

async function getPlaylistVideos(playlistId) {
    const response = await youtube.playlistItems.list({
        part: 'snippet',
        playlistId: playlistId,
        maxResults: 50
    });
    
    return response.data.items.map(item => ({
        videoId: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        videoUrl: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`
    }));
}
```

#### Option 2: Manual Video Entry
**Pros:**
- No external dependencies
- Full control over video content
- No API rate limits

**Cons:**
- More manual work for admins
- Less automation

**Implementation:**
- Remove playlist sync functionality
- Keep manual video upload feature
- Enhance admin UI for bulk video entry

#### Option 3: Alternative Package
**Pros:**
- Drop-in replacement
- Similar API

**Cons:**
- May also become deprecated
- Less reliable than official API

**Packages to consider:**
- `youtube-playlist` (if maintained)
- `yt-playlist` (check maintenance status)

### Migration Steps

1. **Choose solution** (recommend Option 1)
2. **Set up YouTube API key** (if using Option 1)
   - Go to Google Cloud Console
   - Create project
   - Enable YouTube Data API v3
   - Create API key
   - Add to `.env`: `YOUTUBE_API_KEY=your_key_here`

3. **Update code**
   - Replace ytpl imports
   - Update `addPlaylist()` function
   - Update `syncVideos()` function
   - Test thoroughly

4. **Update dependencies**
   ```bash
   npm uninstall ytpl
   npm install googleapis
   ```

5. **Update documentation**

### Workaround (Temporary)
The current implementation still works despite the deprecation warning. You can continue using it while planning the migration, but be aware:
- May break in future Node.js versions
- No bug fixes or security updates
- May have compatibility issues

### Timeline
- **Immediate**: Continue using (works fine)
- **Short-term (1-2 months)**: Plan migration
- **Medium-term (3-6 months)**: Implement YouTube Data API v3
- **Long-term**: Monitor for any breaking changes

---

## 2. No Automated Tests

**Status**: Missing Feature  
**Priority**: High  
**Impact**: Code quality and reliability

### Description
The project currently has no automated tests (unit, integration, or e2e).

### Recommendation
Add testing framework:
```bash
npm install --save-dev jest supertest
```

Create test files:
- `__tests__/auth.test.js`
- `__tests__/tasks.test.js`
- `__tests__/transactions.test.js`

---

## 3. No API Documentation

**Status**: Missing Feature  
**Priority**: Medium  
**Impact**: Developer experience

### Description
No Swagger/OpenAPI documentation for the API endpoints.

### Recommendation
Add Swagger documentation:
```bash
npm install swagger-jsdoc swagger-ui-express
```

---

## 4. No Request Logging

**Status**: Missing Feature  
**Priority**: Low  
**Impact**: Debugging and monitoring

### Description
HTTP requests are not logged systematically.

### Recommendation
Add morgan for HTTP logging:
```bash
npm install morgan
```

```javascript
const morgan = require('morgan');
app.use(morgan('combined'));
```

---

## 5. No Database Indexes

**Status**: Performance Issue  
**Priority**: Medium  
**Impact**: Query performance

### Description
Database queries may be slow without proper indexes.

### Recommendation
Run the indexing script:
```bash
node scripts/add_database_indexes.js
```

---

## Notes
- This document should be updated as issues are resolved
- New issues should be added as they're discovered
- Priority levels: Critical, High, Medium, Low
