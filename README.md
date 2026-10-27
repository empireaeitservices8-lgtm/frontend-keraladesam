# കേരളദേശം - Kerala Desam (Frontend)

Kerala's premier Malayalam digital daily news portal, built with Next.js 14, React 18, TypeScript, Tailwind CSS, and Lucide React.

---

## സവിശേഷതകൾ (Features)

- **Newspaper Masthead & Branding**: Grand centered Kerala Desam masthead banner with responsive scaling and zero element collision across mobile, tablet, and desktop viewports.
- **Modern Malayalam Typography**: Curated Noto Sans Malayalam & Newsreader font hierarchy with instant font-size adjustment (`A-`, `A`, `A+`).
- **Real-Time Breaking News Ticker**: Live synchronized ticker pulling active breaking alerts from the backend database.
- **Editorial Newsroom Admin Studio**: Full-featured admin dashboard (`/admin`) for publishing articles, uploading imagery, managing breaking news, pinning lead headlines, and adding video stories.
- **Video News & Live Broadcasts**: Interactive multi-stream Live TV player (Kerala Desam HD studio, Asianet News, 24 News) and video carousel with modal playback.
- **Digital E-Paper**: Kochi edition e-paper modal with zoom controls and page navigation.
- **Pravasi & World Desk**: Gulf and international news coverage with live 22K gold rate and currency exchange tracker.
- **Offline Bookmarks**: Client-side saved stories drawer using LocalStorage.
- **Live Search**: Autocomplete search bar with instant query matching across titles, leads, tags, and districts.

---

## പ്രോജക്റ്റ് ഘടന (Folder Structure)

```
keraladesyam/
├── public/
│   ├── favicon.ico
│   ├── favicon.png
│   └── logo.png              # Primary Kerala Desam SVG/PNG masthead logo
├── src/
│   ├── app/
│   │   ├── about/            # /about - About Us & Editorial mission
│   │   ├── admin/            # /admin - Editorial Admin Studio Dashboard
│   │   │   ├── login/        # /admin/login - Secure Admin Login
│   │   │   └── register/     # /admin/register - Editor registration
│   │   ├── article/[id]/     # /article/:id - Dynamic full article detail page with TTS audio
│   │   ├── category/[slug]/  # /category/:slug - Category archive (Politics, Cinema, Business...)
│   │   ├── kerala/           # /kerala - 14 Districts regional news desk
│   │   ├── pravasi/          # /pravasi - Diaspora & Middle East desk
│   │   ├── search/           # /search - Full-text search results page
│   │   ├── globals.css       # Tailwind CSS base and newspaper styling rules
│   │   ├── layout.tsx        # RootLayout with FontProvider & AdminAuthProvider
│   │   └── page.tsx          # Homepage with Lead Editorial, Top Stories, Videos
│   ├── components/
│   │   ├── BookmarksDrawer.tsx    # Saved stories slide-out drawer
│   │   ├── EPaperModal.tsx        # Digital E-paper reader modal
│   │   ├── FontContext.tsx        # Dynamic font size & bookmarks context
│   │   ├── Footer.tsx             # Complete news portal footer
│   │   ├── Header.tsx             # Responsive masthead with dead-centered logo & utilities
│   │   ├── LiveTvModal.tsx        # Live streaming broadcast player modal
│   │   └── VideoPlayerModal.tsx   # Video story player modal
│   ├── context/
│   │   └── AdminAuthContext.tsx   # Admin session state & JWT management
│   ├── data/
│   │   └── newsData.ts            # TypeScript interfaces & static fallback constants
│   └── lib/
│       └── api.ts                 # Type-safe API client connecting to backend service
├── .env.local                     # Local environment settings
├── next.config.mjs                # Next.js configuration
├── package.json                   # Dependencies & build scripts
├── tailwind.config.ts             # Tailwind CSS tokens & curated color palette
└── tsconfig.json                  # TypeScript compiler settings
```

---

## പരിസ്ഥിതി ക്രമീകരണങ്ങൾ (Environment Variables)

Create a `.env.local` file inside `keraladesyam/`:

```env
# Local Development API Endpoint:
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Production Deployment (Vercel):
# NEXT_PUBLIC_API_URL=https://kerala-dhesam-admin.vercel.app/api
```

---

## എങ്ങനെ പ്രവർത്തിപ്പിക്കാം (How to Run)

### 1. ഡിപൻഡൻസികൾ ഇൻസ്റ്റാൾ ചെയ്യുക:
```bash
cd keraladesyam
npm install
```

### 2. ടൈപ്പ് ചെക്ക് പരിശോധിക്കുക:
```bash
npx tsc --noEmit
```

### 3. ഡെവലപ്‌മെന്റ് സെർവർ റൺ ചെയ്യുക:
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 4. പ്രൊഡക്ഷൻ ബിൽഡ്:
```bash
npm run build
npm start
```

---

## അഡ്മിൻ പോർട്ടൽ (Editorial Admin Console)

- **URL**: `http://localhost:3000/admin` (or `/admin/login`)
- **Default Admin Account**:
  - Email: `admin@keraladesam.com`
  - Password: `admin12345` (or `password123`)
