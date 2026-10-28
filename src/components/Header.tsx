'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  Calendar,
  Sun,
  Newspaper,
  Search,
  Bell,
  Bookmark,
  Menu,
  X,
  Radio,
  ExternalLink,
  ChevronDown,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { useFont } from './FontContext';
import { Article } from '@/data/newsData';
import { getRealArticles, getRealBreakingNews } from '@/lib/api';
import BookmarksDrawer from './BookmarksDrawer';
import EPaperModal from './EPaperModal';
import LiveTvModal from './LiveTvModal';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  // Do not render newspaper header on dedicated admin editorial routes
  if (pathname?.startsWith('/admin')) {
    return null;
  }
  const { fontSize, setFontSize, savedArticles } = useFont();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Article[]>([]);
  const [breakingNews, setBreakingNews] = useState<string[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bookmarksOpen, setBookmarksOpen] = useState(false);
  const [ePaperOpen, setEPaperOpen] = useState(false);
  const [liveTvOpen, setLiveTvOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const alertsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
        setShowSearchDropdown(false);
      }
      if (alertsContainerRef.current && !alertsContainerRef.current.contains(event.target as Node)) {
        setShowAlertsDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const CITIES_CONFIG = {
    kochi: { name: 'കൊച്ചി', english: 'Kochi', lat: 9.9312, lon: 76.2673, defaultTemp: '31°C' },
  } as const;

  type CityKey = keyof typeof CITIES_CONFIG;

  const [selectedCity, setSelectedCity] = useState<CityKey>('kochi');
  const [currentDate, setCurrentDate] = useState('');
  const [liveWeather, setLiveWeather] = useState<Record<CityKey, { temp: string; condition?: string; isLive: boolean }>>({
    kochi: { temp: '31°C', isLive: false },
  });

  const navLinks = [
    { label: 'TOP NEWS', href: '/' },
    { label: 'KERALA', href: '/kerala' },
    { label: 'INTERNATIONAL', href: '/category/world' },
    { label: 'SPECIAL REPORTS', href: '/category/special' },
    { label: 'POLITICS', href: '/category/politics' },
    { label: 'BUSINESS', href: '/category/business' },
    { label: 'CINEMA', href: '/category/cinema' },
    { label: 'ABOUT US', href: '/about' },
  ];

  // Real-time breaking news sync with live polling and cross-tab events
  useEffect(() => {
    let isMounted = true;
    async function fetchBreaking() {
      try {
        const headlines = await getRealBreakingNews();
        if (isMounted) {
          if (Array.isArray(headlines) && headlines.length > 0) {
            setBreakingNews(headlines);
          }
        }
      } catch (err) {
        console.error('Error fetching breaking news:', err);
      }
    }

    // Initial fetch
    fetchBreaking();

    // Auto-polling interval: check for new breaking news every 8 seconds
    const intervalTimer = setInterval(() => {
      fetchBreaking();
    }, 8000);

    // Instant update on tab focus & visibility change
    const handleFocus = () => {
      fetchBreaking();
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchBreaking();
      }
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    // Real-time cross-tab and local event listeners
    const handleCustomUpdate = () => {
      fetchBreaking();
    };
    const handleStorageUpdate = (e: StorageEvent) => {
      if (e.key === 'keraladesyam_breaking_last_updated') {
        fetchBreaking();
      }
    };
    window.addEventListener('keraladesyam_breaking_updated', handleCustomUpdate);
    window.addEventListener('storage', handleStorageUpdate);

    return () => {
      isMounted = false;
      clearInterval(intervalTimer);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('keraladesyam_breaking_updated', handleCustomUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, [pathname]);
  useEffect(() => {
    setCurrentDate(
      new Date().toLocaleDateString('ml-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
        timeZone: 'Asia/Kolkata',
      })
    );
  }, []);
  // Dynamic search fetch
  React.useEffect(() => {
    let isMounted = true;
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await getRealArticles({ search: searchQuery.trim(), limit: 6 });
        if (isMounted) {
          setSearchResults(res);
        }
      } catch (e) {
        console.error('Search query error:', e);
      }
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchOpen(false);
      setShowSearchDropdown(false);
      setMobileMenuOpen(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Real-time live weather fetch via Open-Meteo API
  useEffect(() => {
    let isMounted = true;
    async function fetchWeather(city: CityKey) {
      try {
        const config = CITIES_CONFIG[city];
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${config.lat}&longitude=${config.lon}&current=temperature_2m,weather_code`,
          { cache: 'no-store' }
        );
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data?.current?.temperature_2m !== undefined) {
          const tempVal = Math.round(data.current.temperature_2m);
          const code = data.current.weather_code;
          let cond = 'തെളിഞ്ഞ വാനം';
          if (code >= 51 && code <= 67) cond = 'മഴ';
          else if (code >= 1 && code <= 3) cond = 'മേഘാവൃതം';
          else if (code >= 95) cond = 'ഇടിമിന്നൽ';
          else if (code >= 45) cond = 'മൂടൽമഞ്ഞ്';

          setLiveWeather((prev) => ({
            ...prev,
            [city]: {
              temp: `${tempVal}°C`,
              condition: cond,
              isLive: true,
            },
          }));
        }
      } catch (err) {
        // Fallback silently if offline
      }
    }

    fetchWeather(selectedCity);
    const timer = setInterval(() => fetchWeather(selectedCity), 15 * 60 * 1000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [selectedCity]);

  return (
    <>
      <header className="relative md:sticky md:top-0 z-40 bg-surface-pure/95 backdrop-blur-md shadow-[0_2px_8px_rgba(10,25,47,0.04)] border-b border-slate-border">
        {/* Top utility ribbon */}
        <div className="bg-ink-midnight text-surface-pure text-caption border-b border-white/10">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-5 text-[11px] md:text-xs min-w-0">
              <span className="flex items-center gap-1.5 sm:gap-2 truncate">
                <Calendar className="w-3 h-3 md:w-3.5 md:h-3.5 text-secondary-fixed-dim shrink-0" />
                <span className="truncate font-medium">
                  {currentDate || 'കേരളദേശം'}
                </span>
              </span>

              {/* Real-time Weather Display for Kochi */}
              <div
                className="hidden md:flex items-center gap-1.5 text-surface-pure/90 hover:text-opinion-ochre transition-colors group cursor-default"
                title={`കൊച്ചി കാലാവസ്ഥ (${liveWeather.kochi.condition || 'കാലാവസ്ഥ'})`}
              >
                <Sun className="w-3.5 h-3.5 text-opinion-ochre group-hover:rotate-45 transition-transform" />
                <span className="font-semibold">
                  കൊച്ചി {liveWeather.kochi.temp}
                </span>
                {liveWeather[selectedCity].isLive && (
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" title="Live Weather API" />
                )}
              </div>

              {/* Clean Editions Ribbon - Kochi Only */}
              <div className="hidden lg:flex items-center gap-1.5 text-secondary-fixed-dim font-medium uppercase tracking-wider text-[11px]">
                <span className="text-white/60">EDITION:</span>
                <span className="text-surface-pure font-bold">
                  KOCHI
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 text-xs font-semibold shrink-0">
              <button
                onClick={() => setEPaperOpen(true)}
                className="flex items-center gap-1.5 text-tertiary-fixed hover:underline font-bold uppercase tracking-wider text-[10px] sm:text-[11px] px-2 py-0.5 rounded hover:bg-white/10 transition-colors"
                title="Read Kerala Desam Digital E-Paper"
              >
                <Newspaper className="w-3.5 h-3.5 text-opinion-ochre" />
                <span>E-PAPER</span>
              </button>

              <div className="flex items-center gap-1 bg-ink-midnight/80 px-2 py-0.5 rounded border border-surface-pure/10">
                <span className="text-secondary-fixed-dim text-[10px] mr-0.5 hidden sm:inline uppercase tracking-wider font-semibold">
                  FONT:
                </span>
                <button
                  onClick={() => setFontSize('sm')}
                  className={`px-1.5 py-0.5 text-[10px] sm:text-xs rounded transition-colors ${fontSize === 'sm' ? 'bg-primary text-white font-bold' : 'text-surface-pure hover:bg-secondary/40'
                    }`}
                  title="Small"
                >
                  A-
                </button>
                <button
                  onClick={() => setFontSize('md')}
                  className={`px-1.5 py-0.5 text-[10px] sm:text-xs rounded transition-colors ${fontSize === 'md' ? 'bg-primary text-white font-bold' : 'text-surface-pure hover:bg-secondary/40'
                    }`}
                  title="Medium"
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize('lg')}
                  className={`px-1.5 py-0.5 text-[10px] sm:text-xs rounded transition-colors ${fontSize === 'lg' ? 'bg-primary text-white font-bold' : 'text-surface-pure hover:bg-secondary/40'
                    }`}
                  title="Large"
                >
                  A+
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Masthead (Screen < md): Controls on top row, BIG CENTERED LOGO */}
        <div className="md:hidden flex flex-col items-center justify-center py-2 px-3 border-b border-slate-100 bg-surface-pure">
          {/* Top Controls Row */}
          <div className="w-full flex items-center justify-between pb-1">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 text-on-surface hover:bg-surface-container rounded-full transition-colors"
                title="മെനു തുറക്കുക"
                aria-label="മെനു തുറക്കുക"
              >
                <Menu className="w-6 h-6" />
              </button>
              <button
                onClick={() => setLiveTvOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-bold text-[11px] shadow-xs active:scale-95 transition-transform"
                title="Watch Live TV"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                <span>LIVE TV</span>
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setBookmarksOpen(true)}
                className="p-2 text-secondary hover:text-primary transition-colors relative rounded-full hover:bg-surface-container"
                title="Saved Stories"
                aria-label="Saved Stories"
              >
                <Bookmark className="w-6 h-6" />
                {savedArticles.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center shadow-xs">
                    {savedArticles.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
                className="p-2 text-secondary hover:text-primary transition-colors relative rounded-full hover:bg-surface-container"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className="w-6 h-6" />
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-live-alert animate-pulse" />
              </button>
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 text-secondary hover:text-primary rounded-full hover:bg-surface-container transition-colors"
                title="വാർത്തകൾ തിരയുക"
                aria-label="വാർത്തകൾ തിരയുക"
              >
                <Search className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Centered BIG Logo for Mobile */}
          <Link href="/" className="flex items-center justify-center py-2 mt-0.5 group w-full" aria-label="കേരളദേശം">
            <div className="relative w-[300px] xs:w-[350px] sm:w-[420px] h-[75px] xs:h-[90px] sm:h-[105px]">
              <Image
                src="/logo.png"
                alt="കേരളദേശം"
                fill
                sizes="(max-width: 640px) 350px, 420px"
                className="object-contain object-center transition-transform group-hover:scale-[1.02]"
                priority
              />
            </div>
          </Link>
        </div>

        {/* Main Masthead Banner (Desktop >= md) */}
        <div className="hidden md:flex items-center justify-center relative w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3 lg:py-5 min-h-[120px] md:min-h-[145px] lg:min-h-[175px]">
          {/* Centered Grand Big & Wide Logo - 100% Dead Center & Completely Unobstructed */}
          <Link
            href="/"
            className="flex items-center justify-center group py-1"
            aria-label="കേരളദേശം"
          >
            <Image
              src="/logo.png"
              alt="കേരളദേശം"
              width={2172}
              height={724}
              priority
              className="w-[380px] sm:w-[420px] md:w-[460px] lg:w-[540px] xl:w-[680px] 2xl:w-[780px] h-auto object-contain transition-transform duration-200 group-hover:scale-[1.01]"
            />
          </Link>
        </div>

        {/* Primary Desktop Navigation Bar */}
        <div className="bg-surface-pure border-t border-slate-border">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 overflow-x-auto lg:overflow-visible no-scrollbar">
            <nav className="flex w-full items-center justify-center gap-1 sm:gap-1.5 lg:gap-2.5 py-2 flex-nowrap min-w-max">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`px-2.5 lg:px-3.5 py-1.5 rounded-md text-xs lg:text-[13px] font-semibold transition-colors whitespace-nowrap ${isActive
                      ? 'bg-primary text-white font-bold shadow-sm'
                      : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
                      }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              {/* Redesigned Premium Live TV Broadcast Button */}
              <button
                onClick={() => setLiveTvOpen(true)}
                className="relative group ml-1.5 sm:ml-2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-bold text-xs shadow-md shadow-red-500/30 hover:shadow-lg hover:shadow-red-600/50 hover:scale-105 active:scale-95 transition-all duration-200 border border-red-400/30 overflow-hidden shrink-0"
                title="Watch Live TV"
              >
                {/* Radiant shimmer light */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out pointer-events-none" />

                {/* Animated Pulsing Beacon Dot */}
                <span className="relative flex h-2.5 w-2.5 items-center justify-center shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                </span>

                {/* Radio Antenna Icon */}
                <Radio className="w-3.5 h-3.5 text-white/95 group-hover:rotate-12 transition-transform shrink-0" />

                {/* English Label */}
                <span className="tracking-wide">LIVE TV</span>

                {/* LIVE Badge */}
                <span className="bg-black/25 backdrop-blur-sm text-[10px] font-black uppercase px-1.5 py-0.5 rounded text-white tracking-wider border border-white/20">
                  LIVE
                </span>
              </button>

              {/* Sleek Vertical Divider */}
              <div className="h-5 w-px bg-slate-border/80 mx-1.5 shrink-0" />

              {/* Actions: Search, Notifications, Saved Stories */}
              <div className="flex items-center gap-1.5 shrink-0 ml-1">
                {/* Search Icon Button & Popover */}
                <div ref={searchContainerRef} className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const next = !searchOpen;
                      setSearchOpen(next);
                      if (next) {
                        setTimeout(() => searchInputRef.current?.focus(), 80);
                      }
                    }}
                    className={`p-2 lg:p-2.5 rounded-full transition-colors flex items-center justify-center ${
                      searchOpen
                        ? 'bg-primary text-white shadow-xs'
                        : 'text-secondary hover:text-primary hover:bg-surface-container'
                    }`}
                    title="വാർത്തകൾ തിരയുക"
                    aria-label="വാർത്തകൾ തിരയുക"
                  >
                    <Search className="w-[22px] h-[22px] lg:w-6 lg:h-6" />
                  </button>

                  {searchOpen && (
                    <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-surface-pure rounded-xl shadow-2xl border border-slate-border p-3 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                      <form onSubmit={handleSearchSubmit} className="relative">
                        <input
                          ref={searchInputRef}
                          type="search"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="വാർത്തകൾ തിരയുക..."
                          className="w-full bg-parchment-base rounded-lg py-2 pl-9 pr-8 text-xs font-medium text-ink-midnight border border-slate-border focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-xs"
                        />
                        <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-secondary pointer-events-none" />
                        {searchQuery && (
                          <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="absolute right-2 top-2.5 text-secondary hover:text-on-surface"
                            title="Clear"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </form>

                      {/* Search Autocomplete Results */}
                      {searchQuery.trim() && (
                        <div className="mt-2 pt-2 border-t border-slate-border max-h-80 overflow-y-auto">
                          <div className="flex justify-between items-center px-1 pb-1 text-[11px] text-secondary font-bold uppercase tracking-wider">
                            <span>ഫലങ്ങൾ ({searchResults.length})</span>
                          </div>
                          {searchResults.length === 0 ? (
                            <div className="p-3 text-xs text-secondary text-center">
                              വാർത്തകൾ കണ്ടെത്താനായില്ല
                            </div>
                          ) : (
                            <div className="divide-y divide-slate-100">
                              {searchResults.slice(0, 5).map((item) => (
                                <Link
                                  key={item.id}
                                  href={`/article/${item.id}`}
                                  onClick={() => {
                                    setSearchOpen(false);
                                    setSearchQuery('');
                                  }}
                                  className="block p-2 rounded hover:bg-surface-container-low transition-colors group"
                                >
                                  <p className="text-xs font-semibold text-ink-midnight group-hover:text-primary line-clamp-2 leading-snug">
                                    {item.title}
                                  </p>
                                  <span className="text-[10px] text-secondary font-medium mt-0.5 inline-block">
                                    {item.category} • {item.timeAgo}
                                  </span>
                                </Link>
                              ))}
                            </div>
                          )}
                          <div className="pt-2 mt-1 border-t border-slate-border text-center">
                            <button
                              type="button"
                              onClick={handleSearchSubmit}
                              className="text-xs text-primary font-bold hover:underline"
                            >
                              എല്ലാ ഫലങ്ങളും കാണുക ({searchResults.length}) →
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Notifications Bell Icon */}
                <div ref={alertsContainerRef} className="relative shrink-0">
                  <button
                    onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
                    className={`p-2 lg:p-2.5 rounded-full transition-colors relative flex items-center justify-center ${
                      showAlertsDropdown
                        ? 'bg-primary text-white shadow-xs'
                        : 'text-secondary hover:text-primary hover:bg-surface-container'
                    }`}
                    title="Notifications"
                    aria-label="Notifications"
                  >
                    <Bell className="w-[22px] h-[22px] lg:w-6 lg:h-6" />
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-live-alert animate-pulse" />
                  </button>

                  {showAlertsDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-surface-pure rounded-xl shadow-2xl border border-slate-border p-3 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-border">
                        <span className="font-bold text-xs text-ink-midnight flex items-center gap-1.5 uppercase tracking-wide">
                          <span className="w-2 h-2 rounded-full bg-editorial-crimson" />
                          NOTIFICATIONS & ALERTS
                        </span>
                        <button
                          onClick={() => setShowAlertsDropdown(false)}
                          className="text-xs text-secondary hover:text-on-surface p-1 rounded hover:bg-slate-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="divide-y divide-slate-border mt-1">
                        {breakingNews.length === 0 ? (
                          <div className="py-4 text-center text-xs text-secondary">
                            നിലവിൽ പുതിയ അറിയിപ്പുകൾ ലഭ്യമല്ല.
                          </div>
                        ) : (
                          breakingNews.slice(0, 4).map((item, idx) => (
                            <Link
                              key={idx}
                              href={`/search?q=${encodeURIComponent(item)}`}
                              onClick={() => setShowAlertsDropdown(false)}
                              className="block py-2 text-xs hover:bg-surface-container-low transition-colors rounded px-1"
                            >
                              <p className="font-medium text-on-surface hover:text-primary line-clamp-2 leading-snug">
                                {item}
                              </p>
                              <span className="text-[10px] text-secondary mt-1 block">
                                Live Desk
                              </span>
                            </Link>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Saved Bookmarks Icon */}
                <button
                  onClick={() => setBookmarksOpen(true)}
                  className="p-2 lg:p-2.5 text-secondary hover:text-primary transition-colors relative rounded-full hover:bg-surface-container shrink-0 flex items-center justify-center"
                  title="Saved Stories"
                  aria-label="Saved Stories"
                >
                  <Bookmark className="w-[22px] h-[22px] lg:w-6 lg:h-6" />
                  {savedArticles.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center shadow-xs">
                      {savedArticles.length}
                    </span>
                  )}
                </button>
              </div>
            </nav>
          </div>
        </div>

      {/* Premium Breaking News Banner */}
      <section className="bg-gradient-to-r from-[#7a0010] via-[#9e051c] to-[#6d000e] text-white border-y border-red-950/40 shadow-sm overflow-hidden select-none">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-center sm:justify-start py-1.5 sm:py-0 sm:h-12 md:h-14 lg:h-16 px-4 sm:px-6 lg:px-8">

          {/* Breaking Label Badge: Centered at top on mobile, on the left on desktop */}
          <div className="flex shrink-0 items-center justify-center gap-1.5 sm:gap-2 md:gap-3 bg-[#4d000a] border border-red-400/30 px-2.5 sm:px-3 md:px-4 py-0.5 sm:py-1 md:py-1.5 rounded-full sm:rounded-md shadow-xs mx-auto sm:mx-0 sm:mr-3 md:mr-4 mb-1 sm:mb-0">
            <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-85" />
              <span className="relative inline-flex h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3 rounded-full bg-white" />
            </span>

            <p className="whitespace-nowrap text-xs md:text-sm font-black uppercase tracking-wider text-white">
              BREAKING NEWS
            </p>
          </div>

          {/* Live Headlines - Continuously Moving Ticker */}
          <div className="flex min-w-0 w-full sm:flex-1 items-center overflow-hidden h-7 sm:h-full">
            {breakingNews.length === 0 ? (
              <div className="flex items-center px-4 text-xs font-medium text-white/85 italic">
                തത്സമയ ബ്രേക്കിംഗ് വാർത്തകൾക്കായി കാത്തിരിക്കുന്നു...
              </div>
            ) : (
              <div className="breaking-track flex w-max shrink-0 items-center">
                {[0, 1, 2].map((copy) => (
                  <div
                    key={copy}
                    className="flex shrink-0 items-center"
                    aria-hidden={copy !== 0}
                  >
                    {breakingNews.map((item, idx) => (
                      <Link
                        key={`${copy}-${idx}-${item}`}
                        href={`/search?q=${encodeURIComponent(item)}`}
                        tabIndex={copy !== 0 ? -1 : undefined}
                        className="shrink-0 whitespace-nowrap px-3 sm:px-5 md:px-7 text-xs sm:text-sm md:text-base font-bold text-white hover:text-red-100 flex items-center transition-colors"
                      >
                        <span className="inline-block w-2 h-2 rounded-full bg-red-300 mr-2 md:mr-3 shrink-0" />
                        {item}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Live 24x7 badge on desktop */}
          <span className="hidden md:inline-flex ml-3 shrink-0 rounded bg-black/35 border border-white/25 px-2.5 py-1 text-xs font-black uppercase tracking-wider text-white shadow-xs">
            LIVE 24x7
          </span>
        </div>
      </section>
    </header>

      {/* Mobile Drawer Menu */ }
  {
    mobileMenuOpen && (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden pt-20 px-4">
        <div className="bg-surface-pure rounded-xl p-5 max-h-[82vh] overflow-y-auto shadow-2xl border border-slate-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-border mb-4">
              <span className="font-headline text-lg font-bold text-primary uppercase tracking-wide">
                KERALA DESAM MENU
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded text-secondary hover:text-on-surface"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Mobile Search Form */}
            <form onSubmit={handleSearchSubmit} className="relative mb-4">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="വാർത്തകൾ തിരയുക... (Enter)"
                className="w-full bg-surface-container-low rounded-lg py-2.5 pl-9 pr-8 text-xs font-medium text-on-surface border border-slate-border focus:outline-none focus:ring-1 focus:ring-primary [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
              />
              <Search className="w-4 h-4 absolute left-3 top-3 text-secondary pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-3 text-secondary hover:text-on-surface"
                  title="Clear"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>

            {/* Navigation Links */}
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2 text-sm font-semibold rounded transition-colors ${isActive
                      ? 'bg-primary text-white font-bold'
                      : 'hover:bg-surface-container text-on-surface'
                      }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Quick Actions in Mobile Drawer */}
          <div className="pt-4 border-t border-slate-border mt-4 space-y-2">
            {/* E-Paper Button */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setEPaperOpen(true);
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors border border-slate-border uppercase tracking-wider text-[11px]"
            >
              <Newspaper className="w-4 h-4 text-editorial-crimson" />
              <span>Read Digital E-Paper</span>
            </button>

            {/* Redesigned Live TV Button in Mobile Drawer */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setLiveTvOpen(true);
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold rounded-lg bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-md shadow-red-500/25 transition-all hover:scale-[1.01] active:scale-95"
            >
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5 items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                </span>
                <Radio className="w-4 h-4 text-white" />
                <span className="uppercase tracking-wider text-[11px]">Watch Live TV</span>
              </div>
              <span className="bg-black/20 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded text-white border border-white/20">
                24x7 HD
              </span>
            </button>

            {/* Bookmarks Button */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setBookmarksOpen(true);
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors border border-slate-border uppercase tracking-wider text-[11px]"
            >
              <span className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-primary" />
                <span>Saved Stories</span>
              </span>
              <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {savedArticles.length}
              </span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  {/* Bookmarks Drawer */ }
  <BookmarksDrawer isOpen={bookmarksOpen} onClose={() => setBookmarksOpen(false)} />

  {/* E-Paper Modal */ }
  <EPaperModal isOpen={ePaperOpen} onClose={() => setEPaperOpen(false)} />

  {/* Live TV Modal */ }
  <LiveTvModal isOpen={liveTvOpen} onClose={() => setLiveTvOpen(false)} />
    </>
  );
}
