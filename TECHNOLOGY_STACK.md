# Kerala Desam (കേരളദേശം) – Technology Stack Report

This document specifies the exact technology stack, libraries, runtimes, and external services utilized in the Kerala Desam project.

---

## 1. Complete Technology Stack Matrix

| Layer | Component / Tool | Version | Active Purpose in Project |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | Next.js (App Router) | `14.2.35` | Server-side rendering (SSR), Static Generation (SSG), dynamic routing, and API caching |
| **UI Library** | React & React DOM | `18.3.1` | Component-driven declarative UI, hooks, and context lifecycle |
| **Language (Frontend)** | TypeScript | `5.6.3` | Static typing, interface contracts, and compile-time error verification |
| **CSS Framework** | Tailwind CSS | `3.4.14` | Utility-first styling with custom Kerala Desam editorial design tokens |
| **CSS Preprocessor** | PostCSS & Autoprefixer | `8.4.47` / `10.4.20` | CSS bundling, vendor prefixing, and browser compatibility |
| **Class Merge Utility** | `clsx` & `tailwind-merge`| `2.1.1` / `2.5.4` | Conflict-free conditional Tailwind class merging |
| **Icon Library** | Lucide React | `0.453.0` | SVG icons across navigation, playback, admin controls, and modals |
| **Image Optimization** | Next.js `<Image>` & Native `<img>` | Built-in | Responsive media delivery, WebP format support, and lazy loading |
| **Backend Runtime** | Node.js | `v20.x LTS` | Event-driven JavaScript server runtime |
| **Backend Framework** | Express.js | `4.21.1` | REST API routing, JSON body parsing, and middleware pipeline |
| **Database Engine** | MySQL 8.0+ / MariaDB | `8.0` | Relational data persistence with ACID compliance |
| **Database Driver** | `mysql2` | `3.24.6` | Connection pooling, prepared statements, and async/await query execution |
| **Authentication** | `jsonwebtoken` (JWT) | `9.0.3` | Cryptographically signed bearer tokens for admin authorization |
| **Password Hashing** | `bcryptjs` | `3.0.3` | Salted one-way cryptographic hashing for passwords |
| **Multipart Uploads** | `multer` | `2.5.0` | Streaming file upload parser for news photography |
| **Cloud Object Storage**| Cloudinary SDK | `1.41.3` | CDN-backed image transformations and persistent media storage |
| **Cloud Object Storage**| Cloudflare R2 | S3 API | Zero-egress fee asset storage |
| **Environment Config** | `dotenv` | `16.4.5` | Secure `.env` variable loading into `process.env` |
| **CORS Middleware** | `cors` | `2.8.5` | Cross-Origin Resource Sharing handling across domains |
| **Cloud Hosting (FE)** | Render Web Service | Cloud Node | Automated git deploys for Next.js frontend |
| **Cloud Hosting (BE)** | Render Web Service | Cloud Node | Automated git deploys for Express REST backend |
| **Typography CDN** | Google Fonts | Web CDN | Malayalam typefaces: Manjari, Gayathri, Noto Sans Malayalam |

---

## 2. Dependencies Audit: Installed vs. Actively Used

### 2.1 Frontend (`keraladesyam/package.json`)

| Package Name | Installed Version | Usage Status | Verification Details |
| :--- | :--- | :--- | :--- |
| `next` | `^14.2.15` (14.2.35) | **Actively Used** | Core application framework (App Router) |
| `react` | `^18.3.1` | **Actively Used** | Core UI rendering engine |
| `react-dom` | `^18.3.1` | **Actively Used** | DOM mounting and client rehydration |
| `lucide-react` | `^0.453.0` | **Actively Used** | Over 120 icons used across all pages and modals |
| `clsx` | `^2.1.1` | **Actively Used** | Conditional CSS joining |
| `tailwind-merge` | `^2.5.4` | **Actively Used** | Utility class deduplication in dynamic widgets |
| `typescript` | `^5.6.3` | **Actively Used** | Type safety across `src/` |
| `tailwindcss` | `^3.4.14` | **Actively Used** | Design styling system |
| `postcss` | `^8.4.47` | **Actively Used** | CSS processing |
| `autoprefixer` | `^10.4.20` | **Actively Used** | CSS cross-browser compatibility |
| `@types/node` | `^20.17.0` | **Actively Used** | Node.js type definitions |
| `@types/react` | `^18.3.11` | **Actively Used** | React component types |
| `@types/react-dom` | `^18.3.1` | **Actively Used** | React DOM types |
| `sharp` | `^0.35.5` | **Actively Used** | Server-side Next.js Image optimization binary |
| `cors` | `^2.8.6` | *Installed (Unused)* | Installed in frontend dependencies; can be omitted or retained |

---

### 2.2 Backend (`backend/package.json`)

| Package Name | Installed Version | Usage Status | Verification Details |
| :--- | :--- | :--- | :--- |
| `express` | `^4.21.1` | **Actively Used** | HTTP server and REST endpoints in `server.js` |
| `mysql2` | `^3.24.6` | **Actively Used** | MySQL pool and queries in `config/mysql.js` and `services/mysqlService.js` |
| `jsonwebtoken` | `^9.0.3` | **Actively Used** | Token generation and verification in `middleware/auth.js` |
| `bcryptjs` | `^3.0.3` | **Actively Used** | Password hashing in `services/mysqlService.js` |
| `dotenv` | `^16.4.5` | **Actively Used** | Environment variable configuration in `server.js` |
| `cors` | `^2.8.5` | **Actively Used** | Cross-Origin resource sharing |
| `multer` | `^2.5.0` | **Actively Used** | Binary file upload streaming in `routes/articleRoutes.js` |
| `cloudinary` | `^1.41.3` | **Actively Used** | Media upload provider in `services/storageService.js` |
| `multer-storage-cloudinary` | `^4.0.0` | **Actively Used** | Cloudinary storage engine integration |

---

## 3. Typography & Fonts Integration

Malayalam typography is served via Google Fonts CDN in `src/app/globals.css`:
- `@import url('https://fonts.googleapis.com/css2?family=Manjari:wght@400;700&family=Gayathri:wght@400;700&family=Noto+Sans+Malayalam:wght@400;500;600;700;800&display=swap');`
- Font classes:
  - `font-manjari`
  - `font-gayathri`
  - `font-noto`
  - `font-headline` (Editorial serif/bold display for news headlines)
  - `font-body-md` (High-readability paragraph flow)
