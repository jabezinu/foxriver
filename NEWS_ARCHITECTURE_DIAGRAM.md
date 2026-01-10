# News System - Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         NEWS SYSTEM                              │
│                    End-to-End Architecture                       │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│              │         │              │         │              │
│  Admin Panel │────────▶│   Backend    │◀────────│  Client App  │
│              │         │   (API)      │         │              │
└──────────────┘         └──────────────┘         └──────────────┘
       │                        │                        │
       │                        │                        │
       ▼                        ▼                        ▼
  Create/Edit              MongoDB                 View/Display
    News                  News Collection            Popup/Page
```

## Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        ADMIN PANEL                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │           admin/src/pages/News.jsx                     │    │
│  │                                                         │    │
│  │  ┌──────────────────────────────────────────────┐     │    │
│  │  │  News Form                                    │     │    │
│  │  │  • Title Input                                │     │    │
│  │  │  • Content Textarea                           │     │    │
│  │  │  • [✓] Show as popup notification             │     │    │
│  │  │  • Submit Button                              │     │    │
│  │  └──────────────────────────────────────────────┘     │    │
│  │                                                         │    │
│  │  ┌──────────────────────────────────────────────┐     │    │
│  │  │  News List                                    │     │    │
│  │  │  • News Item 1 [Popup: Enabled] [Edit] [Del] │     │    │
│  │  │  • News Item 2                   [Edit] [Del] │     │    │
│  │  └──────────────────────────────────────────────┘     │    │
│  └────────────────────────────────────────────────────────┘    │
│                           │                                      │
│                           │ API Call                             │
│                           ▼                                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                          BACKEND API                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Routes (backend/routes/news.js)                       │    │
│  │  • GET  /api/news          → getNews()                 │    │
│  │  • GET  /api/news/popup    → getPopupNews()            │    │
│  │  • POST /api/news          → createNews()              │    │
│  │  • PUT  /api/news/:id      → updateNews()              │    │
│  │  • DELETE /api/news/:id    → deleteNews()              │    │
│  └────────────────────────────────────────────────────────┘    │
│                           │                                      │
│                           ▼                                      │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Controller (backend/controllers/newsController.js)    │    │
│  │  • Handles business logic                              │    │
│  │  • Validates data                                      │    │
│  │  • Queries database                                    │    │
│  └────────────────────────────────────────────────────────┘    │
│                           │                                      │
│                           ▼                                      │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Model (backend/models/News.js)                        │    │
│  │  • title: String                                       │    │
│  │  • content: String                                     │    │
│  │  • showAsPopup: Boolean ◀── NEW FIELD                 │    │
│  │  • status: String                                      │    │
│  │  • publishedDate: Date                                 │    │
│  └────────────────────────────────────────────────────────┘    │
│                           │                                      │
│                           ▼                                      │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │   MongoDB    │
                    │     News     │
                    │  Collection  │
                    └──────────────┘
                            │
                            ▲
                            │
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT APP                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  App.jsx                                               │    │
│  │  • Manages popup display logic                         │    │
│  │  • Fetches popup news on auth                          │    │
│  │  • Renders NewsPopup component                         │    │
│  └────────────────────────────────────────────────────────┘    │
│                           │                                      │
│                           ▼                                      │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Auth Store (client/src/store/authStore.js)           │    │
│  │  • shouldShowNewsPopup: Boolean                        │    │
│  │  • latestNews: Object                                  │    │
│  │  • setLatestNews()                                     │    │
│  │  • hideNewsPopup()                                     │    │
│  └────────────────────────────────────────────────────────┘    │
│                           │                                      │
│                           ▼                                      │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  NewsPopup Component                                   │    │
│  │  ┌──────────────────────────────────────────────┐     │    │
│  │  │  ╔════════════════════════════════════╗      │     │    │
│  │  │  ║  [Official News]            [X]    ║      │     │    │
│  │  │  ║                                    ║      │     │    │
│  │  │  ║  Welcome to FoxRiver!              ║      │     │    │
│  │  │  ║  Published on Jan 10, 2026         ║      │     │    │
│  │  │  ║                                    ║      │     │    │
│  │  │  ║  ┌──────────────────────────┐     ║      │     │    │
│  │  │  ║  │  News content here...    │     ║      │     │    │
│  │  │  ║  │  Lorem ipsum dolor sit   │     ║      │     │    │
│  │  │  ║  └──────────────────────────┘     ║      │     │    │
│  │  │  ║                                    ║      │     │    │
│  │  │  ║  [        Close        ]           ║      │     │    │
│  │  │  ╚════════════════════════════════════╝      │     │    │
│  │  └──────────────────────────────────────────────┘     │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  CompanyNews Page (client/src/pages/CompanyNews.jsx)  │    │
│  │  • Lists all active news                               │    │
│  │  • Click to view full details                          │    │
│  │  • Same content as popup                               │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

### Admin Creates News

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Admin   │────▶│  Admin   │────▶│ Backend  │────▶│ MongoDB  │
│  User    │     │  Panel   │     │   API    │     │          │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
    │                 │                 │                 │
    │ Fill form       │                 │                 │
    │ Check popup     │                 │                 │
    │ Submit          │                 │                 │
    │                 │ POST /api/news  │                 │
    │                 │ {title, content,│                 │
    │                 │  showAsPopup}   │                 │
    │                 │                 │ Save document   │
    │                 │                 │ showAsPopup:true│
    │                 │                 │                 │
    │                 │◀────────────────│◀────────────────│
    │                 │ Success         │                 │
    │◀────────────────│                 │                 │
    │ News created    │                 │                 │
```

### User Sees Popup

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  User    │────▶│  Client  │────▶│ Backend  │────▶│ MongoDB  │
│          │     │   App    │     │   API    │     │          │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
    │                 │                 │                 │
    │ Login           │                 │                 │
    │────────────────▶│                 │                 │
    │                 │ POST /api/auth/ │                 │
    │                 │      login      │                 │
    │                 │────────────────▶│                 │
    │                 │                 │ Verify user     │
    │                 │                 │────────────────▶│
    │                 │◀────────────────│◀────────────────│
    │                 │ {token, user}   │                 │
    │                 │                 │                 │
    │                 │ Set state:      │                 │
    │                 │ shouldShowNews  │                 │
    │                 │ Popup = true    │                 │
    │                 │                 │                 │
    │                 │ GET /api/news/  │                 │
    │                 │      popup      │                 │
    │                 │────────────────▶│                 │
    │                 │                 │ Query:          │
    │                 │                 │ status='active' │
    │                 │                 │ showAsPopup=true│
    │                 │                 │ sort by date    │
    │                 │                 │────────────────▶│
    │                 │◀────────────────│◀────────────────│
    │                 │ {news}          │                 │
    │                 │                 │                 │
    │                 │ Render NewsPopup│                 │
    │◀────────────────│                 │                 │
    │ See popup       │                 │                 │
    │                 │                 │                 │
    │ Click close     │                 │                 │
    │────────────────▶│                 │                 │
    │                 │ hideNewsPopup() │                 │
    │                 │ shouldShowNews  │                 │
    │                 │ Popup = false   │                 │
```

## State Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Auth Store State                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   Initial    │   │  After Login │   │ After Close  │
│    State     │   │   /Register  │   │    Popup     │
├──────────────┤   ├──────────────┤   ├──────────────┤
│ shouldShow   │   │ shouldShow   │   │ shouldShow   │
│ NewsPopup:   │──▶│ NewsPopup:   │──▶│ NewsPopup:   │
│   false      │   │   true       │   │   false      │
│              │   │              │   │              │
│ latestNews:  │   │ latestNews:  │   │ latestNews:  │
│   null       │   │   {data}     │   │   null       │
└──────────────┘   └──────────────┘   └──────────────┘
                            │
                            │
                            ▼
                   ┌──────────────┐
                   │  NewsPopup   │
                   │  Component   │
                   │   Renders    │
                   └──────────────┘
```

## Database Schema Visualization

```
┌─────────────────────────────────────────────────────────────┐
│                    News Collection                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Document 1:                                                 │
│  {                                                           │
│    _id: ObjectId("..."),                                     │
│    title: "Welcome to FoxRiver!",                            │
│    content: "We're excited to announce...",                  │
│    imageUrl: null,                                           │
│    status: "active",                                         │
│    showAsPopup: true,  ◀── Popup enabled                    │
│    publishedDate: ISODate("2026-01-10T10:00:00Z"),          │
│    createdBy: ObjectId("..."),                               │
│    createdAt: ISODate("2026-01-10T09:00:00Z"),              │
│    updatedAt: ISODate("2026-01-10T09:00:00Z")               │
│  }                                                           │
│                                                              │
│  Document 2:                                                 │
│  {                                                           │
│    _id: ObjectId("..."),                                     │
│    title: "Maintenance Schedule",                            │
│    content: "Scheduled maintenance...",                      │
│    imageUrl: null,                                           │
│    status: "active",                                         │
│    showAsPopup: false, ◀── No popup                         │
│    publishedDate: ISODate("2026-01-09T10:00:00Z"),          │
│    createdBy: ObjectId("..."),                               │
│    createdAt: ISODate("2026-01-09T09:00:00Z"),              │
│    updatedAt: ISODate("2026-01-09T09:00:00Z")               │
│  }                                                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘

Indexes:
• { status: 1, publishedDate: -1 }
• { status: 1, showAsPopup: 1, publishedDate: -1 } ◀── NEW
```

## Component Hierarchy

```
App.jsx
├── NewsPopup (conditional)
│   └── Shows when shouldShowNewsPopup && latestNews
│
└── Routes
    └── MainLayout
        └── CompanyNews
            ├── News List
            └── News Detail Modal (conditional)
```

## API Request/Response Flow

### Get Popup News

```
Request:
┌────────────────────────────────┐
│ GET /api/news/popup            │
│ Headers:                       │
│   Authorization: Bearer token  │
└────────────────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│ Backend Processing             │
│ 1. Receive request             │
│ 2. Query MongoDB:              │
│    - status: 'active'          │
│    - showAsPopup: true         │
│    - sort: publishedDate desc  │
│    - limit: 1                  │
│ 3. Return result               │
└────────────────────────────────┘
         │
         ▼
Response:
┌────────────────────────────────┐
│ {                              │
│   "success": true,             │
│   "news": {                    │
│     "_id": "...",              │
│     "title": "Welcome!",       │
│     "content": "...",          │
│     "showAsPopup": true,       │
│     "status": "active",        │
│     "publishedDate": "..."     │
│   }                            │
│ }                              │
└────────────────────────────────┘
```

## Sequence Diagram: Complete User Journey

```
User    Client    AuthStore    API    Backend    MongoDB
 │        │          │         │        │          │
 │ Login  │          │         │        │          │
 │───────▶│          │         │        │          │
 │        │ login()  │         │        │          │
 │        │─────────▶│         │        │          │
 │        │          │ POST    │        │          │
 │        │          │────────▶│        │          │
 │        │          │         │ verify │          │
 │        │          │         │───────▶│          │
 │        │          │         │        │ query    │
 │        │          │         │        │─────────▶│
 │        │          │         │        │◀─────────│
 │        │          │         │◀───────│          │
 │        │          │◀────────│        │          │
 │        │          │ set     │        │          │
 │        │          │ shouldShow       │          │
 │        │          │ Popup=true       │          │
 │        │◀─────────│         │        │          │
 │        │          │         │        │          │
 │        │ useEffect│         │        │          │
 │        │ triggers │         │        │          │
 │        │          │         │        │          │
 │        │ GET popup│         │        │          │
 │        │──────────┼────────▶│        │          │
 │        │          │         │ query  │          │
 │        │          │         │───────▶│          │
 │        │          │         │        │ find     │
 │        │          │         │        │─────────▶│
 │        │          │         │        │◀─────────│
 │        │          │         │◀───────│          │
 │        │◀─────────┼─────────│        │          │
 │        │          │         │        │          │
 │        │ setLatest│         │        │          │
 │        │ News()   │         │        │          │
 │        │─────────▶│         │        │          │
 │        │          │         │        │          │
 │        │ Render   │         │        │          │
 │        │ NewsPopup│         │        │          │
 │◀───────│          │         │        │          │
 │ See    │          │         │        │          │
 │ Popup  │          │         │        │          │
 │        │          │         │        │          │
 │ Close  │          │         │        │          │
 │───────▶│          │         │        │          │
 │        │ hideNews │         │        │          │
 │        │ Popup()  │         │        │          │
 │        │─────────▶│         │        │          │
 │        │          │ set     │        │          │
 │        │          │ shouldShow       │          │
 │        │          │ Popup=false      │          │
 │        │          │         │        │          │
```

---

**Legend:**
- ─────▶ : Data flow / Function call
- ◀───── : Response / Return value
- │      : Component / System boundary
- ┌─┐    : Container / Module
