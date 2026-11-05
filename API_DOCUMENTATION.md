# Kerala Desam (കേരളദേശം) – REST API Documentation

This document provides the full technical specification for the Kerala Desam backend REST API.

**Base URLs**:
- **Production (Render)**: `https://kerala-dhesam-admin.onrender.com/api`
- **Local Development**: `http://localhost:5000/api`

---

## 1. System & Health Endpoints

### 1.1 Health Check
- **Route**: `GET /api/health`
- **Access**: Public
- **Description**: Verifies service status and MySQL engine readiness.
- **Response**: `200 OK`
```json
{
  "status": "ok",
  "database": "mysql",
  "service": "Kerala Desam API",
  "timestamp": "2026-11-05T10:20:24.456Z"
}
```

---

## 2. Authentication & User Management

### 2.1 Admin/Editor Login
- **Route**: `POST /api/auth/login`
- **Access**: Public
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "email": "admin@keraladesam.com",
  "password": "your_secure_password"
}
```
- **Response**: `200 OK`
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "name": "എഡിറ്റർ",
    "email": "admin@keraladesam.com",
    "role": "admin",
    "avatar": ""
  }
}
```

### 2.2 Register Admin/Editor
- **Route**: `POST /api/auth/register`
- **Access**: Private / Admin
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Request Body**:
```json
{
  "name": "Rahul Nambiar",
  "email": "rahul@keraladesam.com",
  "password": "Password123",
  "role": "editor"
}
```

### 2.3 Current User Profile
- **Route**: `GET /api/auth/me`
- **Access**: Private (Bearer token required)
- **Response**: `200 OK` with user details.

---

## 3. Articles API

### 3.1 Get All Articles (Filtered & Paginated)
- **Route**: `GET /api/articles`
- **Access**: Public
- **Query Parameters**:
  - `limit` (integer, default: 20): Maximum records to return.
  - `category` (string, optional): Filter by Malayalam or English category slug.
  - `district` (string, optional): Filter by Kerala district name.
  - `search` (string, optional): Search keyword matching titles and body text.
- **Response**: `200 OK`
```json
{
  "success": true,
  "count": 10,
  "total": 10,
  "articles": [
    {
      "id": "1",
      "customId": "art-wayanad-tunnel-2026",
      "title": "വയനാട് തുരങ്കപ്പാത: അന്തിമ അനുമതിയായി; നിർമ്മാണം ഉടൻ ആരംഭിക്കും",
      "lead": "ആനക്കാംപൊയിൽ-കള്ളാടി-മേപ്പാടി തുരങ്കപ്പാത നിർമ്മാണത്തിനുള്ള അവസാന ഘട്ട അനുമതിയും ലഭിച്ചു.",
      "category": "കേരളം",
      "categoryColor": "#006b9a",
      "imageUrl": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80",
      "imageCaption": "വയനാട് തുരങ്കപ്പാത നിർമ്മാണ മേഖല",
      "readTime": "3 മിനിറ്റ് വായന",
      "audioDuration": "03:15",
      "paragraphs": ["...", "..."],
      "highlights": ["11.5 കിലോമീറ്റർ നീളം", "ഇരുവശത്തും രണ്ട് വരി പാത"],
      "authorName": "പ്രത്യേക ലേഖകൻ",
      "authorDesignation": "എഡിറ്റർ",
      "district": "വയനാട്",
      "viewsCount": 1420,
      "likesCount": 84,
      "isHeadline": true,
      "isBreaking": true,
      "publishedAt": "2026-11-05T08:00:00.000Z"
    }
  ]
}
```

### 3.2 Get Article by ID / Slug
- **Route**: `GET /api/articles/:id`
- **Access**: Public
- **Parameters**: `id` can be numeric ID (`1`) or custom string slug (`art-wayanad-tunnel-2026`).

### 3.3 Create Article
- **Route**: `POST /api/articles`
- **Access**: Private (Editor / Admin)
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Request Body**:
```json
{
  "title": "വാർത്താ തലക്കെട്ട്",
  "lead": "വാർത്തയുടെ സംഗ്രഹം",
  "category": "രാഷ്ട്രീയം",
  "categoryColor": "#006b9a",
  "imageUrl": "https://...",
  "imageCaption": "ചിത്ര വിവരണം",
  "paragraphs": ["ഖണ്ഡിക 1...", "ഖണ്ഡിക 2..."],
  "highlights": ["ഹൈലൈറ്റ് 1", "ഹൈലൈറ്റ് 2"],
  "authorName": "ലേഖകന്റെ പേര്",
  "district": "തിരുവനന്തപുരം",
  "isHeadline": false,
  "isBreaking": false
}
```

### 3.4 Update Article
- **Route**: `PUT /api/articles/:id`
- **Access**: Private (Editor / Admin)
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: Partial or full fields to update.

### 3.5 Delete Article
- **Route**: `DELETE /api/articles/:id`
- **Access**: Private (Admin only)
- **Headers**: `Authorization: Bearer <token>`

### 3.6 Like Article (Increment Likes)
- **Route**: `POST /api/articles/:id/like`
- **Access**: Public

### 3.7 Pin / Unpin Headline
- **Route**: `PATCH /api/articles/:id/headline`
- **Access**: Private (Editor / Admin)
- **Body**: `{ "isHeadline": true }`

---

## 4. Breaking News Ticker API

### 4.1 Get Active Breaking News
- **Route**: `GET /api/breaking`
- **Access**: Public
- **Response**: `200 OK`
```json
{
  "success": true,
  "count": 5,
  "breaking": [
    {
      "id": 1,
      "headline": "വയനാട് തുരങ്കപ്പാതയ്ക്ക് അന്തിമ പാരിസ്ഥിതികാനുമതി ലഭിച്ചു; നിർമ്മാണം ഉടൻ",
      "active": true,
      "priority": 0
    }
  ]
}
```

### 4.2 Create Breaking News Headline
- **Route**: `POST /api/breaking`
- **Access**: Private (Editor / Admin)
- **Body**: `{ "headline": "തത്സമയ ബ്രേക്കിംഗ് വാർത്ത...", "priority": 0 }`

### 4.3 Update Breaking Headline
- **Route**: `PUT /api/breaking/:id`
- **Access**: Private (Editor / Admin)
- **Body**: `{ "headline": "പുതുക്കിയ വാർത്ത...", "active": true }`

### 4.4 Delete Breaking News
- **Route**: `DELETE /api/breaking/:id`
- **Access**: Private (Editor / Admin)

---

## 5. Video Shorts API

### 5.1 Get Videos
- **Route**: `GET /api/videos`
- **Access**: Public
- **Query Parameters**: `limit` (default: 12), `category`

### 5.2 Create Video
- **Route**: `POST /api/videos`
- **Access**: Private (Editor / Admin)
- **Body**:
```json
{
  "title": "വീഡിയോ വിവരണം",
  "videoUrl": "https://www.youtube.com/watch?v=...",
  "category": "പ്രത്യേകം",
  "duration": "02:15",
  "thumbnail": "https://..."
}
```

### 5.3 Delete Video
- **Route**: `DELETE /api/videos/:id`
- **Access**: Private (Editor / Admin)

---

## 6. Photo Story Gallery API

### 6.1 Get Active Photo Story
- **Route**: `GET /api/photo-story`
- **Access**: Public
- **Response**: `200 OK`
```json
{
  "success": true,
  "photoStory": {
    "id": 1,
    "tagLabel": "PHOTO STORY",
    "subtitle": "KERALA IN FRAMES",
    "title": "കുട്ടനാടൻ കായൽ ജീവിതം: വേനൽമഴയുടെ വരവറിയിച്ച് ഓളങ്ങൾ",
    "description": "Visual captures of life, landscapes, and backwaters across God's Own Country.",
    "images": [
      { "url": "https://...", "caption": "കുട്ടനാട് 1" },
      { "url": "https://...", "caption": "കുട്ടനാട് 3" },
      { "url": "https://...", "caption": "ചിത്രം 3 അടിക്കുറിപ്പ്" },
      { "url": "https://...", "caption": "ചിത്രം 4 അടിക്കുറിപ്പ്" },
      { "url": "https://...", "caption": "ചിത്രം 5 അടിക്കുറിപ്പ്" }
    ]
  }
}
```

### 6.2 Update Photo Story
- **Route**: `PUT /api/photo-story`
- **Access**: Private (Editor / Admin)
- **Body**: Full photo story object with updated `images` array.

---

## 7. Media Upload API

### 7.1 Upload Image / Media File
- **Route**: `POST /api/upload`
- **Access**: Private (Editor / Admin)
- **Content-Type**: `multipart/form-data`
- **Form Field**: `image` (binary file)
- **Response**: `200 OK`
```json
{
  "success": true,
  "url": "https://res.cloudinary.com/.../upload/keraladesam/article.jpg",
  "provider": "cloudinary"
}
```

---

## 8. Forex Exchange Rates API

### 8.1 Get Live Currency Rates
- **Route**: `GET /api/forex`
- **Access**: Public
- **Response**: `200 OK` with conversion rates against INR for AED, SAR, QAR, KWD, OMR, BHD, USD, EUR, GBP.

---

## 9. Malayalam Text-to-Speech (TTS) API

### 9.1 Stream Malayalam Audio Narration
- **Route**: `GET /api/tts?text=:encodedMalayalamText`
- **Access**: Public
- **Response**: Streaming `audio/mpeg` MP3 playback.

---

## 10. Advertisements & Inquiries API

### 10.1 Submit Ad Inquiry
- **Route**: `POST /api/ads`
- **Access**: Public
- **Body**:
```json
{
  "name": "Arun Kumar",
  "companyName": "Malabar Spices",
  "phone": "+91 9876543210",
  "email": "arun@malabarspices.com",
  "adType": "Digital Banner",
  "budget": "₹50,000",
  "message": "Interested in homepage leaderboard placement."
}
```

### 10.2 List All Inquiries
- **Route**: `GET /api/ads`
- **Access**: Private (Admin only)

### 10.3 Update Inquiry Status
- **Route**: `PATCH /api/ads/:id`
- **Access**: Private (Admin only)
- **Body**: `{ "status": "Contacted" }` (Options: `New`, `Contacted`, `Confirmed`, `Closed`)

---

## 11. Newsletter Subscribers API

### 11.1 Subscribe
- **Route**: `POST /api/subscribers`
- **Access**: Public
- **Body**: `{ "email": "reader@gmail.com" }`

### 11.2 List Subscribers
- **Route**: `GET /api/subscribers`
- **Access**: Private (Admin only)
