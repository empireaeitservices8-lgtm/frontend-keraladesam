# കേരളദേശം - Kerala Desam | Premier Malayalam News Portal

**Kerala Desam (കേരളദേശം)** is a production-ready, full-stack Malayalam digital journalism portal designed for high reliability, fast page speeds, instant editorial publishing, and comprehensive regional reporting.

---

## 📑 Technical Documentation Index

For comprehensive technical deep dives, please refer to the dedicated documentation files:
- 🏛️ [PROJECT_ARCHITECTURE.md](./PROJECT_ARCHITECTURE.md) – System architecture, network flow, and design patterns.
- 🔄 [WEBSITE_WORKFLOW.md](./WEBSITE_WORKFLOW.md) – Complete frontend and admin portal workflows.
- 📡 [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) – REST API specification with endpoints and payloads.
- 🗄️ [DATABASE_DOCUMENTATION.md](./DATABASE_DOCUMENTATION.md) – MySQL 8.0 schema, indexes, ERD, and persistence.
- 💻 [TECHNOLOGY_STACK.md](./TECHNOLOGY_STACK.md) – Full matrix of actively used libraries and frameworks.
- 🧹 [CLEANUP_REPORT.md](./CLEANUP_REPORT.md) – Code audit, resolved hydration errors, and performance optimizations.

---

## 🌟 Key Features

### 📰 Public News Portal
- **Editorial Newspaper Masthead**: Centered Kerala Desam masthead with responsive mobile and desktop viewports.
- **Dynamic Malayalam Typography**: User-selectable typefaces (**Manjari**, **Gayathri**, **Noto Sans Malayalam**) with instant text size adjustment.
- **Breaking News Marquee Ticker**: Real-time breaking news flash strip with pause-on-hover and audio alert chimes.
- **Lead Headline Feature**: Prominent lead hero story with reading time and author byline.
- **District News Hub**: Dedicated reporting for all 14 districts of Kerala.
- **Malayalam Text-to-Speech (TTS)**: Built-in audio narration player for hands-free news listening.
- **Visual Photo Story Gallery**: Multi-photo feature carousel with photo counter (`5 ചിത്രങ്ങൾ`) and interactive pagination dots.
- **Video Shorts & Reels**: Video carousel with modal player.
- **Forex & Gold Tracker**: Live exchange rates for Gulf NRIs (AED, SAR, QAR, KWD, OMR, BHD) and world currencies against INR.
- **Digital E-Paper Reader**: Interactive Malayalam E-Paper replica with zoom and page flipping.
- **Live TV Streaming**: Embedded live video stream player for special event broadcasts.
- **Offline Bookmarks**: Client-side reading list persisted in browser storage.
- **Full-Text Search**: Fast keyword search across headlines, bodies, and author names.

### 🛡️ Editorial Admin Studio (`/admin`)
- **JWT Authentication**: Secure role-based login (`admin` / `editor`) with session persistence.
- **Article Publishing Studio**: Rich form supporting story paragraphs, bullet highlights, tags, and district categorization.
- **Media Upload Manager**: Select photos directly from mobile gallery or desktop with automatic client-side canvas compression.
- **Breaking News Management**: Instant ticker creation, priority reordering, and toggles.
- **Photo Story Gallery Editor**: Multi-photo upload, reordering (Up/Down), captions, and instant database auto-save.
- **Video Shorts Studio**: Ingest video reels with YouTube embeds.
- **Ad Inquiries Management**: Review and update advertiser requests from `/ad-rates`.
- **Subscriber Directory**: View newsletter subscribers.

---

## 🏗️ Repository Structure

```
keraladesyam/
├── keraladesyam/                 # Frontend Next.js 14 Application
│   ├── src/
│   │   ├── app/                  # App Router pages and layouts
│   │   ├── components/           # Reusable UI components
│   │   ├── context/              # Authentication and font providers
│   │   ├── data/                 # Sample seed data & TypeScript types
│   │   └── lib/api.ts            # API client and real-time synchronization
│   ├── public/                   # Static logos, favicons, and icons
│   ├── next.config.mjs           # Next.js build configuration
│   ├── tailwind.config.ts        # Editorial design system theme
│   └── package.json              # Frontend dependencies
│
└── backend/                      # Backend Node.js Express REST API
    ├── config/mysql.js           # MySQL connection pool and auto-migration
    ├── controllers/              # REST route controllers
    ├── middleware/auth.js        # JWT verification and role authorization
    ├── routes/                   # API routers
    ├── services/                 # Business logic and storage adapters
    ├── data/portal_content.json  # Resilient file-backed persistent content snapshot
    ├── keraladesam_db.sql        # Master database dump
    ├── server.js                 # Application entry point
    └── package.json              # Backend dependencies
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- **Node.js**: v18.17+ or v20.x LTS
- **MySQL**: 8.0+ or MariaDB 10.5+ (optional; file persistence layer will operate automatically if MySQL is offline)
- **Git**

---

### Step 1: Clone the Repositories
```bash
# Clone Frontend
git clone https://github.com/Abin-c-s/kerala-dhesam.git
cd kerala-dhesam

# Clone Backend
git clone https://github.com/Abin-c-s/kerala-dhesam-admin.git
cd kerala-dhesam-admin
```

---

### Step 2: Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
```

Edit `backend/.env` with your settings:
```env
PORT=5000
HOST=0.0.0.0
DB_TYPE=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=keraladesam_db
JWT_SECRET=your_jwt_secret_key
```

Import initial schema (optional, backend automatically initializes tables):
```bash
mysql -u root -p keraladesam_db < keraladesam_db.sql
```

Start the backend:
```bash
npm run dev
# Server runs on http://localhost:5000
```

---

### Step 3: Frontend Setup
```bash
cd keraladesyam

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
```

Edit `keraladesyam/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
API_URL=http://localhost:5000/api
```

Start the frontend dev server:
```bash
npm run dev
# Frontend runs on http://localhost:3000
```

---

## 📦 Production Build & Testing

### Test Backend Endpoints
```bash
cd backend
node scripts/test_http_server.js
```

### Production Build Frontend
```bash
cd keraladesyam
npm run build
npm start
```

---

## 🌐 Render Cloud Deployment Guide

The platform is configured for zero-configuration deployments on **Render**:

### Frontend Service
- **Type**: Web Service
- **Environment**: Node
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Environment Variables**:
  - `NEXT_PUBLIC_API_URL`: `https://kerala-dhesam-admin.onrender.com/api`
  - `API_URL`: `https://kerala-dhesam-admin.onrender.com/api`
  - `NODE_ENV`: `production`

### Backend Service
- **Type**: Web Service
- **Environment**: Node
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment Variables**:
  - `PORT`: `10000` (or leave default assigned by Render)
  - `HOST`: `0.0.0.0`
  - `JWT_SECRET`: `your_secure_secret_key`
  - `FRONTEND_URL`: `https://kerala-dhesam.onrender.com`
  - `DB_HOST`: (Optional: external MySQL host e.g. TiDB, Aiven, Railway, AWS RDS)

---

## 🔧 Troubleshooting Guide

| Issue | Root Cause | Solution |
| :--- | :--- | :--- |
| `listen EADDRINUSE: address already in use :::5000` | Windows reserves IPv6 port 5000 | Backend now binds explicitly to `0.0.0.0` and retries on port 5001 automatically. |
| React Hydration Error `#418` / `#425` | Client-only APIs (`window`, `localStorage`) invoked during SSR | All browser accesses are safely deferred to `useEffect` post-mount. |
| Admin changes not reflecting immediately | Browser SWR caching old response | Cache busting (`cache: 'no-store'`) and `BroadcastChannel` live sync active. |
| Photo Story only displays 3 photos | 3-column desktop carousel viewport | Use the `<` `>` arrows or click the bottom pagination dots; counter displays total. |

---

## 📄 License & Ownership
Copyright © 2026 Kerala Desam Media Network. All rights reserved.
