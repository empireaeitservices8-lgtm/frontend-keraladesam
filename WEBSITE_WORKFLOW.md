# Kerala Desam (കേരളദേശം) – Complete Website Workflow & Feature Map

This document details the functional workflows of both the **Public Portal** and the **Editorial Admin Portal**, explaining how data is created, processed, stored, and rendered across the complete stack.

---

## Part 1: Public Website Workflows

### 1. Homepage & Top Feed
- **What it does**: Displays the comprehensive news dashboard containing pinned editorial headlines, category quick filters, latest feeds, video shorts, photo gallery, and trending sidebars.
- **Frontend Component**: `src/app/page.tsx`
- **API Endpoint**: `GET /api/articles?limit=25`, `GET /api/videos?limit=12`, `GET /api/photo-story`
- **Backend Controller**: `backend/controllers/articleController.js::getArticles`, `videoController.js::getVideos`, `photoStoryController.js::getPhotoStory`
- **Database Tables**: `articles`, `videos`, `photo_stories`
- **Display Logic**: On page load, client-side rehydration checks `localStorage` for cached data (`kd_home_articles`, `kd_photo_story`) to achieve 0ms First Contentful Paint. Concurrently, `getRealArticles({ bypassCache: true })` fetches live database articles, deduplicates records via `deduplicateArticles()`, and smoothly updates the DOM.

---

### 2. Header, Date Bar & Live Weather
- **What it does**: Displays the Kerala Desam brand masthead, current Gregorian & Malayalam calendar date, live prayer/weather alerts, navigation links, and action buttons (Live TV, E-Paper, Font Switcher, Bookmarks).
- **Frontend Component**: `src/components/Header.tsx`
- **API Endpoint**: N/A (Client utilities and Next.js static asset routing)
- **Database Tables**: N/A
- **Display Logic**: Live Malayalam date formatting is computed inside a post-hydration `useEffect` to prevent server-client time mismatches. Font sizing and font-family selectors link to `FontContext`.

---

### 3. Breaking News Ticker (തത്സമയം വാർത്തകൾ)
- **What it does**: Continuously scrolls critical flash alerts across the top bar. Includes audio play chime and pause-on-hover controls.
- **Frontend Component**: `src/components/Header.tsx` (ticker strip)
- **API Endpoint**: `GET /api/breaking`
- **Backend Controller**: `backend/controllers/breakingController.js::getBreakingNews`
- **Database Table**: `breaking_news` (where `active = 1` ordered by `priority ASC, id DESC`)
- **Display Logic**: The frontend fetches headlines using `getRealBreakingNews()`, removes duplicates, and animates them with CSS marquee (`animate-marquee`). When an alert arrives, the user is notified without page reload.

---

### 4. Hero News Section (പ്രധാന വാർത്ത)
- **What it does**: Displays the most important lead story prominently with high-resolution image, lead summary, author byline, reading time, and direct read action.
- **Frontend Component**: `src/app/page.tsx` (Hero layout block)
- **API Endpoint**: `GET /api/articles`
- **Backend Controller**: `backend/controllers/articleController.js::getArticles`
- **Database Table**: `articles` (prioritizing `is_headline = 1` or latest `id DESC`)
- **Display Logic**: `page.tsx` checks for any article with `isHeadline === true`; if none is marked, the first article in the feed is selected.

---

### 5. Category-Based Journalism & Filter Strip
- **What it does**: Enables readers to filter journalism by topics: കേരളം (Kerala), രാഷ്ട്രീയം (Politics), പ്രവാസം (NRI/Gulf), ബിസിനസ് (Business), സ്പോർട്സ് (Sports), സിനിമ & കല (Cinema), സാങ്കേതികം (Technology), ആരോഗ്യം (Health), and പരിസ്ഥിതി (Environment).
- **Frontend Components**: `src/app/page.tsx` (filter pills) and `src/app/category/[slug]/page.tsx` (dedicated category page)
- **API Endpoint**: `GET /api/articles?category=:slug`
- **Backend Controller**: `backend/controllers/articleController.js::getArticles`
- **Database Table**: `articles` (`WHERE LOWER(category) LIKE ?`)
- **Display Logic**: Supports client-side instantaneous filtering on homepage pill clicks, and dedicated server-rendered search-engine-friendly URLs (`/category/politics`, `/category/gulf`).

---

### 6. District-Based News Portal (ജില്ലാ വാർത്തകൾ)
- **What it does**: Localized reporting for all 14 districts of Kerala (തിരുവനന്തപുരം, കൊല്ലം, പത്തനംതിട്ട, ആലപ്പുഴ, കോട്ടയം, ഇടുക്കി, എറണാകുളം, തൃശൂർ, പാലക്കാട്, മലപ്പുറം, കോഴിക്കോട്, വയനാട്, കണ്ണൂർ, കാസർഗോഡ്).
- **Frontend Component**: `src/app/kerala/page.tsx`
- **API Endpoint**: `GET /api/articles?district=:districtName`
- **Backend Controller**: `backend/controllers/articleController.js::getArticles`
- **Database Table**: `articles` (`WHERE district = ?`)
- **Display Logic**: Readers can choose their home district from an interactive visual grid or dropdown selector; articles tagged with that district are immediately displayed.

---

### 7. Article Details Page & Malayalam Text-to-Speech (വാർത്താ വായന)
- **What it does**: Complete news article view featuring headline, lead paragraph, full story paragraphs, key highlights bullet points, author profile, related stories, social share tools, and integrated Malayalam Text-to-Speech audio reader.
- **Frontend Component**: `src/app/article/[id]/page.tsx`
- **API Endpoints**: `GET /api/articles/:id`, `GET /api/tts?text=...`, `POST /api/articles/:id/like`
- **Backend Controllers**: `backend/controllers/articleController.js::getArticleById`, `backend/routes/ttsRoutes.js`
- **Database Table**: `articles` (`WHERE custom_id = ? OR id = ?`)
- **Display Logic**: Loads the article dynamically via server route; reader can listen to the article in spoken Malayalam using the audio player bar, toggle text size, and add the story to their offline Bookmarks.

---

### 8. Global Search Portal (വാർത്താ തിരച്ചിൽ)
- **What it does**: Allows instant keyword searching across news headlines, article body paragraphs, authors, and category tags.
- **Frontend Component**: `src/app/search/page.tsx`
- **API Endpoint**: `GET /api/articles?search=:query`
- **Backend Controller**: `backend/controllers/articleController.js::getArticles`
- **Database Table**: `articles` (`WHERE title LIKE ? OR lead LIKE ? OR category LIKE ?`)
- **Display Logic**: Query parameters (`?q=keyword`) are captured from the search input, debounced, and submitted to the API, displaying search matches with highlighted snippets.

---

### 9. Video Shorts & Reels (വീഡിയോകൾ)
- **What it does**: Horizontal carousel of video journalism shorts and YouTube reels with play duration badge and instant video modal player.
- **Frontend Components**: `src/app/page.tsx` (carousel) and `src/components/VideoPlayerModal.tsx`
- **API Endpoint**: `GET /api/videos`
- **Backend Controller**: `backend/controllers/videoController.js::getVideos`
- **Database Table**: `videos`
- **Display Logic**: Clicking any video thumbnail launches `VideoPlayerModal.tsx`, rendering an embedded responsive iframe player with video title, description, and views counter.

---

### 10. Photo Stories Gallery (ഫോട്ടോ സ്റ്റോറി - Kerala in Frames)
- **What it does**: Visual journalism showcase with multi-photo horizontal carousel, captions, counter badge (`5 ചിത്രങ്ങൾ`), and interactive pagination dot navigation.
- **Frontend Component**: `src/app/page.tsx` (Photo Story section)
- **API Endpoint**: `GET /api/photo-story`
- **Backend Controller**: `backend/controllers/photoStoryController.js::getPhotoStory`
- **Database Table**: `photo_stories`
- **Display Logic**: Fetches the active story containing an array of photo objects (`url`, `caption`). Displays 3 cards across desktop with smooth arrow and dot navigation allowing readers to view all photos.

---

### 11. Forex & Currency Rates (വിനിമയ നിരക്കുകൾ)
- **What it does**: Displays real-time foreign currency exchange rates against the Indian Rupee (INR) for Gulf NRIs (AED, SAR, QAR, KWD, OMR, BHD) and international currencies (USD, EUR, GBP).
- **Frontend Component**: `src/app/page.tsx` (Forex widget)
- **API Endpoint**: `GET /api/forex`
- **Backend Route**: `backend/routes/forexRoutes.js`
- **Display Logic**: Caches rates for 30 minutes, calculating conversion values and displaying trend indicators (up/down).

---

### 12. Digital E-Paper Reader (ഇ-പേപ്പർ)
- **What it does**: Digital replica reader of the printed Kerala Desam newspaper, complete with page thumbnails, date archives, zoom controls, and page flip actions.
- **Frontend Component**: `src/components/EPaperModal.tsx`
- **API Endpoint**: Static SVG/Canvas reader integration
- **Display Logic**: Triggered via the "E-Paper" button in the main header; readers can navigate pages and read print edition articles.

---

### 13. Live TV Broadcast Modal (ലൈവ് ടിവി)
- **What it does**: Opens an uninterrupted live video stream player for special editorial broadcasts and breaking event coverage.
- **Frontend Component**: `src/components/LiveTvModal.tsx`
- **Display Logic**: Triggered by the "Live TV" pulsing button in the header; renders an embedded HLS/YouTube live player.

---

### 14. Advertisements & Rate Inquiry (പരസ്യങ്ങൾ)
- **What it does**: Displays digital sponsor banners and offers a self-service inquiry form for businesses wishing to advertise.
- **Frontend Component**: `src/app/ad-rates/page.tsx`
- **API Endpoint**: `POST /api/ads`
- **Backend Controller**: `backend/controllers/adController.js::createAdInquiry`
- **Database Table**: `ad_inquiries`
- **Display Logic**: Businesses submit their name, phone, company, ad type (Banner, Sponsored Story, Video), and budget. The inquiry is saved to the database for administrative review.

---

### 15. Newsletter Subscription (വാർത്താക്കുറിപ്പുകൾ)
- **What it does**: Collects reader emails for daily morning and evening news digests.
- **Frontend Component**: `src/components/Footer.tsx`
- **API Endpoint**: `POST /api/subscribers`
- **Backend Controller**: `backend/controllers/subscriberController.js::createSubscriber`
- **Database Table**: `subscribers`
- **Display Logic**: Validates email format, prevents duplicate subscriptions with friendly alerts, and stores subscriber records.

---

## Part 2: Admin Panel Workflows (`/admin`)

### 1. Authentication & Session Persistence
- **Workflow**:
  1. Admin navigates to `/admin/login`.
  2. Submits credentials to `POST /api/auth/login`.
  3. On success, backend returns a signed JWT token and user profile object.
  4. Frontend stores token in `localStorage.setItem('keraladesam_admin_jwt', token)`.
  5. `AdminAuthContext` maintains session state. Unauthenticated requests to `/admin` are automatically redirected to `/admin/login`.

---

### 2. Admin Dashboard Overview
- **Workflow**: Displays live counter cards:
  - Total Published Articles
  - Active Breaking Alerts
  - Published Videos
  - Total Newsletter Subscribers
  - Pending Ad Inquiries
- Fetches real-time metrics via parallel promises on tab selection.

---

### 3. Article Creation Workflow (വാർത്ത തയ്യാറാക്കൽ)
- **Workflow**:
  1. Editor enters Malayalam Headline, Lead paragraph, and Category.
  2. Selects District (for Kerala local reporting).
  3. Uploads Featured Image:
     - **Device Upload**: File is selected from local desktop/mobile, compressed via HTML5 canvas, and uploaded via `POST /api/upload` (or converted to optimized Base64).
     - **External URL**: Editor can paste direct image link.
  4. Editor adds multiple Story Paragraphs, Bullet Highlights, and Tags.
  5. Clicks "പ്രസിദ്ധീകരിക്കുക" (Publish).
  6. Frontend dispatches `POST /api/articles` with Bearer token.
  7. Backend validates, inserts into `articles` table, updates `portal_content.json`, and returns newly created article with unique `customId`.
  8. Broadcast event synchronizes active visitor tabs in real-time.

---

### 4. Article Edit & Headline Pinning Workflow
- **Workflow**:
  - Editor clicks "എഡിറ്റ് ചെയ്യുക" (Edit) on any article in the articles tab.
  - Opens modal with pre-populated fields.
  - Editor can update paragraphs, change featured image, or toggle "പ്രധാന വാർത്തയാക്കുക" (Pin as Headline).
  - Submits `PUT /api/articles/:id`.
  - Backend updates the record and clears older pinned headlines if this article is newly pinned.

---

### 5. Article Deletion Workflow
- **Workflow**:
  - Editor clicks "ഡിലീറ്റ്" (Delete) and confirms prompt.
  - Frontend dispatches `DELETE /api/articles/:id`.
  - Backend deletes from MySQL table and removes from persistent file layer.

---

### 6. Breaking News Ticker Management
- **Workflow**:
  - Editor types breaking headline and clicks "ചേർക്കുക" (Add).
  - Dispatches `POST /api/breaking`.
  - Backend inserts record with `active = 1`.
  - Editor can toggle visibility or delete expired alerts.

---

### 7. Video Shorts Management
- **Workflow**:
  - Editor submits video title, YouTube URL or video link, category, and duration.
  - Dispatches `POST /api/videos`.
  - Stored in `videos` table and immediately available in the homepage Video Shorts carousel.

---

### 8. Photo Story Gallery Management
- **Workflow**:
  - Editor sets feature title, subtitle, and description.
  - Adds multiple photos via device gallery upload or URL.
  - Can reorder photos (Up/Down) or remove individual frames.
  - Autosaves changes via `PUT /api/photo-story`.
  - Live homepage updates immediately with all 5 photos and pagination navigation.

---

### 9. Advertisement Inquiries Management
- **Workflow**:
  - Admin reviews incoming advertising requests submitted through `/ad-rates`.
  - Admin updates inquiry status: `New` -> `Contacted` -> `Confirmed` -> `Closed`.
  - Dispatches `PATCH /api/ads/:id`.

---

### 10. Subscriber Management
- **Workflow**:
  - Admin views all verified newsletter subscribers.
  - Can export list or unsubscribe inactive addresses.
