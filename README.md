# കേരളദേശം - Kerala Desam (Frontend)

Kerala's premier Malayalam digital daily news portal, built with Next.js 14, React, TypeScript, and modern CSS styling.

## Features
- **Modern Malayalam Typography & Design**: Optimized for readability with responsive multi-column editorial layouts.
- **Breaking News Ticker**: Real-time ticker with live updates.
- **Editorial Admin Studio**: Complete newsroom publishing console for creating, editing, and managing articles and breaking updates.
- **Live TV Player**: Interactive multi-channel streaming player (Kerala Desam HD studio, Asianet News, 24 News).
- **Category Filtering**: State politics, infrastructure, diaspora/gulf, business, entertainment, and districts.
- **Audio News Reader**: Integrated audio duration and text-to-speech companion format.
- **Instant Search**: Full-text searching across headlines, leads, tags, and districts.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Icons**: Lucide React
- **API Communication**: REST API connected to Express + MongoDB backend

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional)
Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## Editorial Admin Console
- **URL**: `http://localhost:3000/admin/login`
- **Default Credentials**: Available via the quick demo button on the login screen.
