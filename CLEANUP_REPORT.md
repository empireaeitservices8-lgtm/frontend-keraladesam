# Kerala Desam (കേരളദേശം) – Codebase Cleanup & Audit Report

This report documents the comprehensive audit, safe cleanup, performance optimization, and bug resolution performed on the Kerala Desam project.

---

## 1. Audit Summary & Risk Assessment Table

Every file in the repository was inspected against cross-references, runtime imports, and deployment configurations.

| File / Component Path | Status | References Checked | Risk Level | Action Taken / Audit Finding |
| :--- | :--- | :--- | :--- | :--- |
| `src/app/layout.tsx` | Retained | Root Next.js Layout | Critical | Hydration mismatch fixed; `suppressHydrationWarning` retained safely on html/body. |
| `src/app/page.tsx` | Retained | Root Homepage Route | High | Hydration deferred; Photo Story gallery enhanced with counter and dot pagination. |
| `src/components/Header.tsx` | Retained | Mounted in `layout.tsx` | High | Replaced synchronous `localStorage` reading with post-mount hydration to fix React #418/#425. |
| `src/components/BookmarksDrawer.tsx` | Retained | Referenced in `Header.tsx` | Medium | Removed inline `localStorage.getItem` evaluation from JSX rendering to eliminate hydration drift. |
| `src/components/Footer.tsx` | Retained | Mounted in `layout.tsx` | Medium | Social links cleaned; newsletter subscription verified. |
| `src/components/EPaperModal.tsx` | Retained | Header navigation modal | Low | Retained; full digital E-Paper functionality operational. |
| `src/components/LiveTvModal.tsx` | Retained | Header streaming modal | Low | Retained; live player operational. |
| `src/components/VideoPlayerModal.tsx`| Retained | Homepage video carousel | Low | Retained; embedded video player operational. |
| `src/components/FontContext.tsx` | Retained | Mounted in `layout.tsx` | High | Manjari/Gayathri/Noto typography state preserved. |
| `src/context/AdminAuthContext.tsx` | Retained | Mounted in `layout.tsx` | High | Fixed infinite redirect freeze on `/admin` unauthenticated sessions. |
| `src/lib/api.ts` | Retained | Imported across all routes | Critical | Fixed SWR cache busting; updated `DEFAULT_PHOTO_STORY` to 5 live photos; added abort timeout. |
| `backend/server.js` | Retained | Backend application entry | Critical | Bound explicitly to `0.0.0.0` and added `EADDRINUSE` port retry handling for Windows. |
| `backend/services/mysqlService.js` | Retained | Imported by all controllers | Critical | Added resilient JSON file synchronization (`portal_content.json`) for zero data loss. |
| `backend/services/storageService.js`| Retained | Upload endpoints | High | Verified Cloudinary, Cloudflare R2, and resilient inline Base64 storage fallbacks. |
| `backend/.env.example` | Modified | Git template | Low | Cleaned up residual passwords to clean placeholder `DB_PASSWORD=your_mysql_password`. |
| `keraladesyam/.env.example` | Created | Git template | Low | Created standardized environment template for Next.js frontend deployment. |
| `keraladesyam/.eslintrc.json` | Created | Linter config | Low | Created clean Next.js Core Web Vitals configuration. |
| `backend/scripts/` | Retained | Developer verification | Low | Preserved verification scripts (`generate_sql_dump.js`, `test_http_server.js`). |

---

## 2. Critical Bugs Identified & Resolved

### 2.1 React Hydration Errors (#418, #425, #423)
- **Root Cause**: Components (`Header.tsx`, `BookmarksDrawer.tsx`, `page.tsx`) accessed browser-only APIs (`window`, `localStorage.getItem`, `new Date()`) directly during server-side initial rendering. Server HTML output differed from the client's initial DOM reconciliation, triggering Minified React errors #418, #425, and forcing client fallback #423.
- **Resolution**:
  - Implemented `isMounted` state flags and deferred browser state hydration strictly to `useEffect()`.
  - Replaced inline `localStorage.getItem` in JSX with state-driven bookmarks.
  - Formatted Malayalam dates and times using timezone-safe formatting (`Asia/Kolkata`).

### 2.2 Admin Content Persistence & Live Sync Delay
- **Root Cause**:
  1. The API client cached database responses aggressively in session/local storage without busting cache on mutations.
  2. The frontend in production attempted to reach `http://localhost:5000/api` when `API_URL` environment variables were omitted.
- **Resolution**:
  - Configured `getApiBaseUrl()` to prioritize `RENDER_API_BASE_URL` (`https://kerala-dhesam-admin.onrender.com/api`) for all HTTPS and Render domain traffic.
  - Set `cache: 'no-store'` for all administrative queries (`adminGetArticles`, `adminGetRawBreaking`, `adminGetVideos`).
  - Implemented cross-tab synchronization with `BroadcastChannel('keraladesyam_live_sync')`.

### 2.3 Photo Story 5-Photo Gallery Synchronization
- **Root Cause**:
  1. Desktop carousel width was set to 3 cards (`calc(33.333% - 14px)`), hiding photos #4 and #5 offscreen to the right without a counter or pagination indicators.
  2. The fallback `DEFAULT_PHOTO_STORY` contained an obsolete photo (`കുട്ടനാട് 2`) that reappeared on initial client mount before live fetch completed.
  3. Reordering photos in Admin did not auto-save to the database.
- **Resolution**:
  - Added dynamic `{activeStory.images.length} ചിത്രങ്ങൾ` counter badge in the section header.
  - Added interactive pagination dots beneath the carousel for direct navigation to any photo.
  - Updated `DEFAULT_PHOTO_STORY` to match the 5 live photos from the database.
  - Enabled auto-saving on image addition and reordering in `src/app/admin/page.tsx`.

### 2.4 Windows EADDRINUSE Port Collision
- **Root Cause**: Windows system services hold reservations on IPv6 `:::5000`. Running `app.listen(PORT)` without explicit host binding triggered `listen EADDRINUSE: address already in use :::5000`.
- **Resolution**: Explicitly bound `HOST = '0.0.0.0'` in `server.js` and added graceful retry on port 5001 if occupied.

---

## 3. Code Optimization & Quality Improvements

1. **Dead Code & Comment Cleanup**:
   - Cleaned redundant console logging statements in production fetch pipelines.
   - Preserved all Malayalam explanatory comments and docstrings.
2. **Bundle Optimization**:
   - Next.js production build produces 13/13 static and dynamic routes with First Load JS shared by all pages of only **87.3 kB**.
3. **Zero TypeScript Errors**:
   - Verified with `npx tsc --noEmit` with 0 type errors.
