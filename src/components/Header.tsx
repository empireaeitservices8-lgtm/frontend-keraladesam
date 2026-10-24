'use client';

import React, { useState } from 'react';
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
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bookmarksOpen, setBookmarksOpen] = useState(false);
  const [ePaperOpen, setEPaperOpen] = useState(false);
  const [liveTvOpen, setLiveTvOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<'kochi' | 'tvm' | 'calicut'>('kochi');
  const [cityToast, setCityToast] = useState<string | null>(null);

  const weatherData = {
    kochi: { name: 'കൊച്ചി', temp: '31°C', condition: 'സൂര്യപ്രകാശം' },
    tvm: { name: 'തിരുവനന്തപുരം', temp: '32°C', condition: 'തെളിഞ്ഞ വാനം' },
    calicut: { name: 'കോഴിക്കോട്', temp: '30°C', condition: 'ഈർപ്പമുള്ള കാലാവസ്ഥ' },
  };

  const navLinks = [
    { label: 'പ്രധാന വാർത്തകൾ', href: '/' },
    { label: 'ലോകം', href: '/category/world' },
    { label: 'കേരളം', href: '/kerala' },
    { label: 'പ്രവാസം', href: '/pravasi' },
    { label: 'പ്രത്യേക റിപ്പോർട്ട്', href: '/article/wayanad-tunnel' },
    { label: 'രാഷ്ട്രീയം', href: '/category/politics' },
    { label: 'ബിസിനസ്', href: '/category/business' },
    { label: 'സിനിമ', href: '/category/cinema' },
    { label: 'സ്പോർട്സ്', href: '/category/sports' },
    { label: 'അഭിപ്രായം', href: '/category/opinion' },
    { label: 'ഞങ്ങളെക്കുറിച്ച്', href: '/about' },
  ];

  // Load real breaking news on mount
  React.useEffect(() => {
    let isMounted = true;
    async function fetchBreaking() {
      try {
        const headlines = await getRealBreakingNews();
        if (isMounted && headlines.length > 0) {
          setBreakingNews(headlines);
        }
      } catch (err) {
        console.error('Error fetching breaking news:', err);
      }
    }
    fetchBreaking();
    return () => {
      isMounted = false;
    };
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
      setShowSearchDropdown(false);
      setMobileMenuOpen(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCityChange = (city: 'kochi' | 'tvm' | 'calicut') => {
    setSelectedCity(city);
    setCityToast(`${weatherData[city].name} പതിപ്പ് സജീവമാക്കി`);
    setTimeout(() => setCityToast(null), 2500);
  };

  return (
    <>
      <header className="relative md:sticky md:top-0 z-40 bg-surface-pure/95 backdrop-blur-md shadow-[0_2px_8px_rgba(10,25,47,0.04)] border-b border-slate-border">
        {/* Top utility ribbon */}
        <div className="bg-ink-midnight text-surface-pure text-caption">
          <div className="max-w-[1360px] mx-auto px-3 md:px-margin-desktop h-8 md:h-9 flex items-center justify-between">
            <div className="flex items-center gap-space-lg text-[11px] md:text-xs">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 md:w-3.5 md:h-3.5 text-secondary-fixed-dim" />
                <span>2025 മാർച്ച് 29, ശനി</span>
              </span>
              <div className="hidden md:flex items-center gap-1.5 cursor-pointer group">
                <Sun className="w-3.5 h-3.5 text-opinion-ochre" />
                <span>
                  {weatherData[selectedCity].name} {weatherData[selectedCity].temp}
                </span>
                <span className="text-[10px] text-secondary-fixed-dim ml-1">
                  ({weatherData[selectedCity].condition})
                </span>
              </div>
              <div className="hidden lg:flex items-center gap-2 text-secondary-fixed-dim">
                <span>പതിപ്പുകൾ:</span>
                <button
                  onClick={() => handleCityChange('tvm')}
                  className={`hover:underline ${selectedCity === 'tvm' ? 'text-surface-pure font-bold underline' : 'text-surface-pure/80'
                    }`}
                >
                  തിരുവനന്തപുരം
                </button>
                <span>|</span>
                <button
                  onClick={() => handleCityChange('kochi')}
                  className={`hover:underline ${selectedCity === 'kochi' ? 'text-surface-pure font-bold underline' : 'text-surface-pure/80'
                    }`}
                >
                  കൊച്ചി
                </button>
                <span>|</span>
                <button
                  onClick={() => handleCityChange('calicut')}
                  className={`hover:underline ${selectedCity === 'calicut' ? 'text-surface-pure font-bold underline' : 'text-surface-pure/80'
                    }`}
                >
                  കോഴിക്കോട്
                </button>
                <span>|</span>
                <Link href="/pravasi" className="text-secondary-fixed hover:underline font-medium">
                  ഗൾഫ് / NRI
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-space-md text-xs">
              <button
                onClick={() => setEPaperOpen(true)}
                className="flex items-center gap-1 text-tertiary-fixed hover:underline font-medium"
                title="കേരളദേശം ഡിജിറ്റൽ ഇ-പേപ്പർ വായിക്കുക"
              >
                <Newspaper className="w-3.5 h-3.5" />
                <span>ഇ-പേപ്പർ</span>
              </button>

              <div className="flex items-center gap-1 bg-ink-midnight/80 px-2 py-0.5 rounded border border-surface-pure/10">
                <span className="text-secondary-fixed-dim text-[11px] mr-1 hidden sm:inline">
                  അക്ഷരവലിപ്പം:
                </span>
                <button
                  onClick={() => setFontSize('sm')}
                  className={`px-1.5 py-0.5 rounded transition-colors ${fontSize === 'sm' ? 'bg-primary text-white font-bold' : 'text-surface-pure hover:bg-secondary/40'
                    }`}
                  title="ചെറുത്"
                >
                  A-
                </button>
                <button
                  onClick={() => setFontSize('md')}
                  className={`px-1.5 py-0.5 rounded transition-colors ${fontSize === 'md' ? 'bg-primary text-white font-bold' : 'text-surface-pure hover:bg-secondary/40'
                    }`}
                  title="സാധാരണ"
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize('lg')}
                  className={`px-1.5 py-0.5 rounded transition-colors ${fontSize === 'lg' ? 'bg-primary text-white font-bold' : 'text-surface-pure hover:bg-secondary/40'
                    }`}
                  title="വലുത്"
                >
                  A+
                </button>
              </div>

              {/* Editor / Admin Link */}
              <Link
                href="/admin"
                className="flex items-center gap-1 text-[11px] bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded text-white font-medium transition-colors border border-white/10"
                title="എഡിറ്റർ / അഡ്മിൻ കൺസോൾ"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-editorial-crimson" />
                <span className="hidden sm:inline">എഡിറ്റർ ഡെസ്ക്</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Masthead Banner */}
        <div className="max-w-[1360px] mx-auto px-3 md:px-margin-desktop h-16 md:h-20 flex items-center justify-between gap-2 md:gap-space-lg">
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-2 md:gap-space-md">
            <Link href="/" className="flex items-center group py-0.5" aria-label="കേരളദേശം">
              <div className="relative h-12 md:h-16 w-56 sm:w-68 md:w-76 transition-transform duration-300 group-hover:scale-[1.02]">
                <Image
                  src="/logo.png"
                  alt="കേരളദേശം"
                  fill
                  className="object-contain object-left"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Center: Live Updates Status Strip (Clickable to open Live TV) */}
          <button
            onClick={() => setLiveTvOpen(true)}
            className="hidden lg:flex items-center bg-error-container/40 hover:bg-error-container text-editorial-crimson px-4 py-1.5 rounded-full gap-2 border border-error-container transition-all hover:scale-105 active:scale-95 group shadow-xs cursor-pointer"
            title="തത്സമയ ലൈവ് വാർത്തകൾ കാണുക"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-editorial-crimson opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-editorial-crimson" />
            </span>
            <span className="font-label-ticker text-xs tracking-wide font-bold">
              ലൈവ് അപ്‌ഡേറ്റുകൾ സജീവം • 14 ജില്ലകൾ
            </span>
            <Radio className="w-3.5 h-3.5 text-editorial-crimson opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all" />
          </button>

          {/* Search Bar & User Actions */}
          <div className="flex items-center gap-3">
            {/* Search Input Box */}
            <form onSubmit={handleSearchSubmit} className="relative hidden md:block w-64 lg:w-72">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchDropdown(true);
                }}
                onFocus={() => setShowSearchDropdown(true)}
                placeholder="വാർത്തകൾ തിരയുക... (Enter)"
                className="w-full bg-parchment-base rounded-full py-1.5 pl-9 pr-4 text-xs font-medium text-on-surface border border-slate-border focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              />
              <Search className="w-4 h-4 absolute left-3 top-2 text-secondary pointer-events-none" />

              {/* Search Autocomplete Dropdown */}
              {showSearchDropdown && searchQuery.trim() && (
                <div className="absolute top-10 left-0 right-0 bg-surface-pure rounded-lg shadow-xl border border-slate-border p-2 z-50 max-h-80 overflow-y-auto">
                  <div className="flex justify-between items-center px-2 py-1 text-[11px] text-secondary border-b border-slate-border">
                    <span>ഫലങ്ങൾ ({searchResults.length})</span>
                    <button
                      type="button"
                      onClick={() => setShowSearchDropdown(false)}
                      className="text-xs text-secondary hover:text-on-surface"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {searchResults.length === 0 ? (
                    <div className="p-3 text-xs text-secondary text-center">
                      <p className="mb-2">ഫലങ്ങളൊന്നും കണ്ടെത്തിയില്ല</p>
                      <button
                        type="submit"
                        className="text-primary font-bold hover:underline"
                      >
                        പൂർണ്ണ തിരച്ചിൽ നടത്തുക →
                      </button>
                    </div>
                  ) : (
                    <>
                      {searchResults.slice(0, 5).map((item) => (
                        <Link
                          key={item.id}
                          href={`/article/${item.id}`}
                          onClick={() => setShowSearchDropdown(false)}
                          className="block p-2 rounded hover:bg-surface-container-low transition-colors"
                        >
                          <p className="text-xs font-semibold text-on-surface line-clamp-1">
                            {item.title}
                          </p>
                          <span className="text-[10px] text-secondary">
                            {item.category} • {item.timeAgo}
                          </span>
                        </Link>
                      ))}
                      <div className="p-2 border-t border-slate-border mt-1 text-center">
                        <button
                          type="submit"
                          className="text-xs text-primary font-bold hover:underline"
                        >
                          എല്ലാ ഫലങ്ങളും കാണുക ({searchResults.length}) →
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </form>

            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
                className="p-2 text-secondary hover:text-primary transition-colors relative rounded-full hover:bg-surface-container"
                title="അറിയിപ്പുകൾ"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-live-alert" />
              </button>

              {showAlertsDropdown && (
                <div className="absolute right-0 top-10 w-80 bg-surface-pure rounded-lg shadow-xl border border-slate-border p-3 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-border">
                    <span className="font-bold text-xs text-ink-midnight flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-editorial-crimson" />
                      പ്രധാന അറിയിപ്പുകൾ
                    </span>
                    <button
                      onClick={() => setShowAlertsDropdown(false)}
                      className="text-xs text-secondary hover:text-on-surface"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="divide-y divide-slate-border mt-1">
                    {(breakingNews.length > 0 ? breakingNews : ["തത്സമയ വാർത്തകൾ ഡാറ്റാബേസിൽ നിന്ന് അപ്‌ഡേറ്റ് ചെയ്യുന്നു..."]).slice(0, 4).map((item, idx) => (
                      <Link
                        key={idx}
                        href="/category/politics"
                        onClick={() => setShowAlertsDropdown(false)}
                        className="block py-2 text-xs hover:bg-surface-container-low transition-colors rounded px-1"
                      >
                        <p className="font-medium text-on-surface hover:text-primary line-clamp-2 leading-snug">
                          {item}
                        </p>
                        <span className="text-[10px] text-secondary mt-1 block">തത്സമയ ഡെസ്ക്</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Saved Bookmarks Drawer Trigger */}
            <button
              onClick={() => setBookmarksOpen(true)}
              className="p-2 text-secondary hover:text-primary transition-colors relative rounded-full hover:bg-surface-container"
              title="സംരക്ഷിച്ച വാർത്തകൾ കാണുക"
            >
              <Bookmark className="w-5 h-5" />
              {savedArticles.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-in zoom-in">
                  {savedArticles.length}
                </span>
              )}
            </button>

            {/* Mobile Search Quick Trigger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-secondary hover:text-primary md:hidden rounded-full hover:bg-surface-container"
              title="വാർത്തകൾ തിരയുക"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-on-surface lg:hidden rounded hover:bg-surface-container"
              title="മെനു തുറക്കുക"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Primary Desktop Navigation Bar */}
        <div className="bg-surface-pure border-t border-slate-border">
          <div className="max-w-[1360px] mx-auto px-4 md:px-margin-desktop overflow-x-auto no-scrollbar">
            <nav className="flex items-center gap-1 py-1.5 min-w-max text-xs font-semibold">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-sm transition-all whitespace-nowrap ${isActive
                      ? 'bg-primary-container text-white font-bold shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                      }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              {/* Redesigned Premium Live TV Broadcast Button */}
              <button
                onClick={() => setLiveTvOpen(true)}
                className="relative group ml-auto sm:ml-2 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-bold text-xs shadow-md shadow-red-500/30 hover:shadow-lg hover:shadow-red-600/50 hover:scale-105 active:scale-95 transition-all duration-200 border border-red-400/30 overflow-hidden shrink-0"
                title="തത്സമയ ലൈവ് ടിവി ബ്രോഡ്കാസ്റ്റ് കാണുക"
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

                {/* Malayalam Label */}
                <span className="tracking-wide">ലൈവ് ടിവി</span>

                {/* LIVE Badge */}
                <span className="bg-black/25 backdrop-blur-sm text-[10px] font-black uppercase px-1.5 py-0.5 rounded text-white tracking-wider border border-white/20">
                  LIVE
                </span>
              </button>
            </nav>
          </div>
        </div>

        {/* Breaking News Ticker Ribbon */}
        <div className="bg-parchment-base border-t border-slate-border">
          <div className="max-w-[1360px] mx-auto px-3 md:px-margin-desktop h-8 md:h-10 flex items-center overflow-hidden">
            <div className="flex items-center bg-primary text-on-primary px-2 py-0.5 md:px-3 md:py-1 font-label-ticker text-[10px] md:text-xs uppercase shrink-0 gap-1 md:gap-1.5 shadow-sm rounded-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-surface-pure animate-ping" />
              <span>ബ്രേക്കിംഗ്</span>
            </div>
            <div className="overflow-hidden whitespace-nowrap px-4 text-xs font-medium text-on-surface flex-1">
              <div className="animate-ticker space-x-12">
                {(breakingNews.length > 0 ? breakingNews.concat(breakingNews) : ["കേരളദേശം തത്സമയ വാർത്തകൾ • 14 ജില്ലകളിലെ സമഗ്ര വിവരങ്ങൾ"]).map((item, idx) => (
                  <Link
                    key={idx}
                    href="/category/politics"
                    className="inline-block text-on-surface hover:text-primary transition-colors cursor-pointer mr-8"
                  >
                    • {item}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* City Switcher Toast Feedback */}
        {cityToast && (
          <div className="bg-emerald-600 text-white text-xs font-semibold py-1 px-4 text-center animate-in fade-in flex items-center justify-center gap-1.5 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{cityToast}</span>
          </div>
        )}
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden pt-20 px-4">
          <div className="bg-surface-pure rounded-xl p-5 max-h-[82vh] overflow-y-auto shadow-2xl border border-slate-border flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-border mb-4">
                <span className="font-headline text-lg font-bold text-primary">കേരളദേശം മെനു</span>
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
                  placeholder="വാർത്തകൾ തിരയുക..."
                  className="w-full bg-surface-container-low rounded-lg py-2 pl-9 pr-3 text-xs font-medium text-on-surface border border-slate-border focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-secondary" />
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
                      className={`px-3 py-2 text-sm font-semibold rounded transition-colors ${
                        isActive
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
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors border border-slate-border"
              >
                <Newspaper className="w-4 h-4 text-editorial-crimson" />
                <span>ഡിജിറ്റൽ ഇ-പേപ്പർ വായിക്കുക</span>
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
                  <span>കേരളദേശം ലൈവ് ടിവി കാണുക</span>
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
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors border border-slate-border"
              >
                <span className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-primary" />
                  <span>സംരക്ഷിച്ച വാർത്തകൾ</span>
                </span>
                <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {savedArticles.length}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bookmarks Drawer */}
      <BookmarksDrawer isOpen={bookmarksOpen} onClose={() => setBookmarksOpen(false)} />

      {/* E-Paper Modal */}
      <EPaperModal isOpen={ePaperOpen} onClose={() => setEPaperOpen(false)} />

      {/* Live TV Modal */}
      <LiveTvModal isOpen={liveTvOpen} onClose={() => setLiveTvOpen(false)} />
    </>
  );
}
