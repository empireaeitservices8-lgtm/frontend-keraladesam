'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  Calendar,
  Sun,
  Newspaper,
  Search,
  Bell,
  BellRing,
  Bookmark,
  Menu,
  X,
  Radio,
  CheckCheck,
  Clock,
} from 'lucide-react';
import { useFont } from './FontContext';
import { Article } from '@/data/newsData';
import { getRealArticles, getRealBreakingNews } from '@/lib/api';
import BookmarksDrawer from './BookmarksDrawer';
import EPaperModal from './EPaperModal';
import LiveTvModal from './LiveTvModal';

// Social Media Links with authentic brand colors and vector icons
const SOCIAL_LINKS = [
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/keraladesam',
    bg: 'bg-[#1877F2]',
    icon: (
      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    name: 'YouTube',
    href: 'https://www.youtube.com/@keraladesam',
    bg: 'bg-[#FF0000]',
    icon: (
      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/keraladesam',
    bg: 'bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF]',
    icon: (
      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    name: 'X (Twitter)',
    href: 'https://twitter.com/keraladesam',
    bg: 'bg-black',
    icon: (
      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: 'WhatsApp',
    href: 'https://whatsapp.com/channel/keraladesam',
    bg: 'bg-[#25D366]',
    icon: (
      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.301-.15-1.78-.877-2.056-.978-.276-.1-.477-.15-.678.15-.2.301-.777.978-.953 1.18-.175.201-.351.226-.652.075-.301-.15-1.272-.469-2.423-1.496-.896-.799-1.5-1.786-1.677-2.088-.175-.301-.019-.464.132-.614.135-.135.301-.351.451-.527.15-.175.2-.301.301-.501.1-.201.05-.376-.025-.526-.075-.15-.677-1.633-.928-2.238-.244-.589-.493-.509-.678-.519-.175-.01-.376-.01-.577-.01-.201 0-.527.075-.802.376-.276.301-1.053 1.029-1.053 2.508s1.078 2.909 1.229 3.11c.15.201 2.122 3.24 5.141 4.544.718.31 1.279.495 1.716.634.721.229 1.377.197 1.896.119.579-.087 1.78-.727 2.031-1.43.25-.702.25-1.304.175-1.43-.075-.125-.276-.201-.577-.351zM12.04 21.785a9.71 9.71 0 0 1-4.966-1.356l-.356-.211-3.693.969.986-3.6-.231-.368A9.728 9.728 0 0 1 2.303 12.05C2.303 6.677 6.666 2.314 12.04 2.314c2.603 0 5.05 1.014 6.892 2.856a9.686 9.686 0 0 1 2.854 6.88c0 5.374-4.363 9.735-9.746 9.735zm8.307-16.64A11.66 11.66 0 0 0 12.04.314C5.565.314.298 5.58.298 12.05c0 2.067.538 4.086 1.56 5.867L0 23.703l5.968-1.566a11.69 11.69 0 0 0 5.772 1.618h.005c6.474 0 11.741-5.267 11.741-11.737 0-3.136-1.222-6.084-3.439-8.303z" />
      </svg>
    ),
  },
  {
    name: 'Telegram',
    href: 'https://t.me/keraladesam',
    bg: 'bg-[#229ED9]',
    icon: (
      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
        <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.562 8.161c-.18.786-.889 3.75-1.25 5.334-.153.67-.398.895-.634.917-.514.047-.905-.34-1.402-.666-.78-.51-1.222-.827-1.977-1.325-.873-.574-.307-.89.19-.408.13.126 2.388 2.188 2.433 2.238.057.062.109.117.005.176-.104.059-.444-.067-.624-.132-.38-.138-2.433-1.611-3.435-2.29-.462-.313-.88-.47-1.253-.462-.411.008-1.203.232-1.792.423-.722.235-.806.353-.78.752.015.228.329.463.942.705 3.693 1.609 6.16 2.67 7.4 3.183 3.52 1.464 4.252 1.718 4.73 1.727.105.002.339-.023.492-.147.129-.105.165-.246.182-.345.017-.099.039-.323.022-.498z" />
      </svg>
    ),
  },
];

interface NotificationItem {
  id: string;
  type: 'breaking' | 'article';
  title: string;
  category: string;
  categoryColor: string;
  timeAgo: string;
  imageUrl?: string;
  url: string;
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const { fontSize, setFontSize, savedArticles } = useFont();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Article[]>([]);
  const [breakingNews, setBreakingNews] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('kd_breaking_news');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return [];
  });
  const [notificationArticles, setNotificationArticles] = useState<Article[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('kd_notification_articles');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return [];
  });
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const [notificationTab, setNotificationTab] = useState<'all' | 'breaking' | 'articles'>('all');
  const [browserPushAllowed, setBrowserPushAllowed] = useState(false);
  const lastPushTitleRef = useRef<string>('');

  const [searchOpen, setSearchOpen] = useState(false);
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bookmarksOpen, setBookmarksOpen] = useState(false);
  const [ePaperOpen, setEPaperOpen] = useState(false);
  const [liveTvOpen, setLiveTvOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const alertsContainerRef = useRef<HTMLDivElement>(null);

  const [currentDate, setCurrentDate] = useState('');
  const [liveTemp, setLiveTemp] = useState('31°C');
  const [isLiveTemp, setIsLiveTemp] = useState(false);

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

  // Click outside listener for dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
      if (alertsContainerRef.current && !alertsContainerRef.current.contains(event.target as Node)) {
        setShowAlertsDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Notifications read state & push permissions
  useEffect(() => {
    try {
      const stored = localStorage.getItem('keraladesyam_read_notifications');
      if (stored) setReadNotificationIds(JSON.parse(stored));
    } catch { }
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setBrowserPushAllowed(Notification.permission === 'granted');
    }
  }, []);

  // Real-time breaking news & notifications sync
  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      try {
        const [headlines, latest] = await Promise.all([
          getRealBreakingNews(),
          getRealArticles({ limit: 12 }),
        ]);

        if (isMounted) {
          if (Array.isArray(headlines) && headlines.length > 0) {
            setBreakingNews(headlines);
            if (typeof window !== 'undefined') {
              try { localStorage.setItem('kd_breaking_news', JSON.stringify(headlines)); } catch {}
            }
            if (
              typeof window !== 'undefined' &&
              'Notification' in window &&
              Notification.permission === 'granted' &&
              headlines.length > 0 &&
              headlines[0] !== lastPushTitleRef.current &&
              document.visibilityState !== 'visible'
            ) {
              lastPushTitleRef.current = headlines[0];
              try {
                new Notification('കേരളദേശം ബ്രേക്കിംഗ് ന്യൂസ്', {
                  body: headlines[0],
                  icon: '/logo.png',
                });
              } catch { }
            }
          }
          if (Array.isArray(latest) && latest.length > 0) {
            setNotificationArticles(latest);
            if (typeof window !== 'undefined') {
              try { localStorage.setItem('kd_notification_articles', JSON.stringify(latest)); } catch {}
            }
          }
        }
      } catch (err) {
        console.error('Error fetching notifications data:', err);
      }
    }

    fetchData();
    const intervalTimer = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchData();
      }
    }, 30000);
    const handleFocus = () => fetchData();
    const handleBreakingUpdate = () => fetchData();

    window.addEventListener('focus', handleFocus);
    window.addEventListener('keraladesyam_breaking_updated', handleBreakingUpdate);
    window.addEventListener('keraladesyam_articles_updated', handleBreakingUpdate);
    window.addEventListener('storage', handleBreakingUpdate);

    return () => {
      isMounted = false;
      clearInterval(intervalTimer);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('keraladesyam_breaking_updated', handleBreakingUpdate);
      window.removeEventListener('keraladesyam_articles_updated', handleBreakingUpdate);
      window.removeEventListener('storage', handleBreakingUpdate);
    };
  }, [pathname]);

  // Clean date & weather setup
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

    let isMounted = true;
    async function fetchWeather() {
      try {
        const res = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=9.9312&longitude=76.2673&current=temperature_2m',
          { cache: 'no-store' }
        );
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data?.current?.temperature_2m !== undefined) {
            setLiveTemp(`${Math.round(data.current.temperature_2m)}°C`);
            setIsLiveTemp(true);
          }
        }
      } catch { }
    }
    fetchWeather();
    const weatherTimer = setInterval(fetchWeather, 15 * 60 * 1000);
    return () => {
      isMounted = false;
      clearInterval(weatherTimer);
    };
  }, []);

  // Search autocomplete query fetch
  useEffect(() => {
    let isMounted = true;
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await getRealArticles({ search: searchQuery.trim(), limit: 6 });
        if (isMounted) setSearchResults(res);
      } catch { }
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
      setMobileMenuOpen(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Helper to match breaking headline with articles
  function findArticleForHeadline(headline: string, articlesList: Article[]): Article | undefined {
    if (!headline || !articlesList || articlesList.length === 0) return undefined;
    const clean = (s: string) =>
      (s || '').toLowerCase().replace(/[\s\u200B-\u200D\uFEFF'"`’‘“”.;:!?।,-]+/g, ' ').trim();
    const hClean = clean(headline);
    return articlesList.find((a) => {
      const aClean = clean(a.title);
      return aClean.includes(hClean.slice(0, 15)) || hClean.includes(aClean.slice(0, 15));
    });
  }

  // Unified Notifications list
  const notificationsList: NotificationItem[] = useMemo(() => {
    const list: NotificationItem[] = [];
    const seenArticleIds = new Set<string>();

    breakingNews.forEach((b) => {
      const matched = findArticleForHeadline(b, notificationArticles);
      const articleId = matched?._id || matched?.id || matched?.customId;
      if (articleId) seenArticleIds.add(String(articleId));

      list.push({
        id: `breaking-${b.trim()}`,
        type: 'breaking',
        title: b,
        category: matched?.category || 'ബ്രേക്കിംഗ് ന്യൂസ്',
        categoryColor: '#dc2626',
        timeAgo: matched?.timeAgo || 'തത്സമയം',
        imageUrl: matched?.imageUrl,
        url: articleId ? `/article/${articleId}` : `/search?q=${encodeURIComponent(b.trim())}`,
      });
    });

    notificationArticles.forEach((art) => {
      const artId = String(art._id || art.id || art.customId || '');
      if (artId && seenArticleIds.has(artId)) return;
      if (artId) seenArticleIds.add(artId);

      list.push({
        id: `art-${artId}`,
        type: 'article',
        title: art.title,
        category: art.category || 'വാർത്ത',
        categoryColor: art.categoryColor || '#C8102E',
        timeAgo: art.timeAgo || art.publishedAt || 'ഇന്ന്',
        imageUrl: art.imageUrl,
        url: `/article/${artId}`,
      });
    });

    return list;
  }, [breakingNews, notificationArticles]);

  const unreadCount = useMemo(() => {
    return notificationsList.filter((item) => !readNotificationIds.includes(item.id)).length;
  }, [notificationsList, readNotificationIds]);

  const markAllAsRead = () => {
    const allIds = notificationsList.map((item) => item.id);
    setReadNotificationIds(allIds);
    try {
      localStorage.setItem('keraladesyam_read_notifications', JSON.stringify(allIds));
    } catch { }
  };

  const handleNotificationClick = (item: NotificationItem) => {
    if (!readNotificationIds.includes(item.id)) {
      const updated = [...readNotificationIds, item.id];
      setReadNotificationIds(updated);
      try {
        localStorage.setItem('keraladesyam_read_notifications', JSON.stringify(updated));
      } catch { }
    }
    setShowAlertsDropdown(false);
  };

  const requestBrowserNotification = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setBrowserPushAllowed(perm === 'granted');
        if (perm === 'granted') {
          new Notification('കേരളദേശം വാർത്തകൾ', {
            body: 'തത്സമയ ബ്രേക്കിംഗ് അറിയിപ്പുകൾ സജീവമാക്കി!',
            icon: '/logo.png',
          });
        }
      } catch { }
    }
  };

  const filteredNotifications = useMemo(() => {
    if (notificationTab === 'breaking') return notificationsList.filter((n) => n.type === 'breaking');
    if (notificationTab === 'articles') return notificationsList.filter((n) => n.type === 'article');
    return notificationsList;
  }, [notificationsList, notificationTab]);

  // Shared Notifications Panel (Unified for Desktop Popover & Mobile Sheet)
  const renderNotificationPanel = (isMobile = false) => (
    <div className={`flex flex-col bg-surface-pure ${isMobile ? 'max-h-[85vh]' : 'w-96 rounded-xl shadow-2xl border border-slate-border max-h-[500px] overflow-hidden'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-slate-border bg-slate-50/60 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-editorial-crimson animate-pulse" />
          <span className="font-bold text-xs sm:text-sm text-ink-midnight tracking-wider uppercase">
            അറിയിപ്പുകൾ & അലേർട്ടുകൾ
          </span>
          {unreadCount > 0 && (
            <span className="bg-editorial-crimson text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              {unreadCount} പുതിയത്
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowAlertsDropdown(false)}
          className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-200/60 transition-colors"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-2 bg-slate-100/80 text-xs font-semibold border-b border-slate-200/60 shrink-0">
        {(['all', 'breaking', 'articles'] as const).map((tab) => {
          const labels = {
            all: `എല്ലാം (${notificationsList.length})`,
            breaking: `ബ്രേക്കിംഗ് (${breakingNews.length})`,
            articles: `വാർത്തകൾ (${notificationArticles.length})`,
          };
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setNotificationTab(tab)}
              className={`flex-1 py-1 rounded-md text-center transition-colors text-[11px] ${notificationTab === tab
                ? 'bg-white text-ink-midnight shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              {labels[tab]}
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="overflow-y-auto divide-y divide-slate-100 p-1.5 flex-1 max-h-[380px]">
        {filteredNotifications.length === 0 ? (
          <div className="py-10 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
            <Bell className="w-8 h-8 text-slate-300" />
            <p>നിലവിൽ പുതിയ അറിയിപ്പുകൾ ലഭ്യമല്ല.</p>
          </div>
        ) : (
          filteredNotifications.map((item) => (
            <Link
              key={item.id}
              href={item.url}
              onClick={() => handleNotificationClick(item)}
              className={`block p-2.5 transition-colors rounded-lg ${!readNotificationIds.includes(item.id) ? 'bg-red-50/50 hover:bg-red-50' : 'hover:bg-slate-50'
                }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    {item.type === 'breaking' ? (
                      <span className="inline-flex items-center gap-1 bg-red-600 text-white font-bold text-[9px] px-1.5 py-0.5 rounded-2xs uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        ബ്രേക്കിംഗ്
                      </span>
                    ) : (
                      <span
                        className="text-white font-bold text-[9px] px-1.5 py-0.5 rounded-2xs uppercase tracking-wider"
                        style={{ backgroundColor: item.categoryColor || '#C8102E' }}
                      >
                        {item.category}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" /> {item.timeAgo}
                    </span>
                    {!readNotificationIds.includes(item.id) && (
                      <span className="w-1.5 h-1.5 rounded-full bg-editorial-crimson ml-auto" />
                    )}
                  </div>
                  <h4 className="font-semibold text-xs text-ink-midnight line-clamp-2 leading-snug hover:text-primary transition-colors">
                    {item.title}
                  </h4>
                </div>
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="w-11 h-11 object-cover rounded-md shrink-0 border border-slate-200"
                  />
                )}
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 border-t border-slate-border bg-slate-50/80 flex items-center justify-between gap-2 text-[11px] shrink-0">
        <button
          type="button"
          onClick={requestBrowserNotification}
          className="flex items-center gap-1 text-slate-600 hover:text-primary transition-colors font-medium"
        >
          <BellRing className="w-3.5 h-3.5 text-editorial-crimson" />
          <span>{browserPushAllowed ? 'അറിയിപ്പുകൾ സജീവം' : 'അറിയിപ്പുകൾ ഓൺ ചെയ്യുക'}</span>
        </button>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            className="text-primary hover:underline font-semibold flex items-center gap-1 ml-auto"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>എല്ലാം വായിക്കുക</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      <header className="relative md:sticky md:top-0 z-40 bg-surface-pure/95 backdrop-blur-md shadow-[0_2px_8px_rgba(10,25,47,0.04)] border-b border-slate-border">
        {/* Top utility ribbon */}
        <div className="bg-ink-midnight text-surface-pure text-caption border-b border-white/10">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-5 text-[11px] md:text-xs min-w-0">
              <span className="flex items-center gap-1.5 sm:gap-2 truncate">
                <Calendar className="w-3 h-3 md:w-3.5 md:h-3.5 text-secondary-fixed-dim shrink-0" />
                <span className="truncate font-medium">{currentDate || 'കേരളദേശം'}</span>
              </span>

              {/* Real-time Weather Display for Kochi */}
              <div
                className="hidden md:flex items-center gap-1.5 text-surface-pure/90 hover:text-opinion-ochre transition-colors group cursor-default"
                title="കൊച്ചി കാലാവസ്ഥ"
              >
                <Sun className="w-3.5 h-3.5 text-opinion-ochre group-hover:rotate-45 transition-transform" />
                <span className="font-semibold">കൊച്ചി {liveTemp}</span>
                {isLiveTemp && (
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
                )}
              </div>

              {/* Editions Ribbon */}
              <div className="hidden lg:flex items-center gap-1.5 text-secondary-fixed-dim font-medium uppercase tracking-wider text-[11px]">
                <span className="text-white/60">EDITION:</span>
                <span className="text-surface-pure font-bold">KOCHI</span>
                <span>|</span>
                <span>UAE</span>
                <span>|</span>
                <span>GCC</span>
                <span>|</span>
                <span>AUSTRALIA</span>
                <span>|</span>
                <span>CANADA</span>
                <span>|</span>
                <span>UK</span>
                <span>|</span>
                <span>USA</span>
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

              <Link
                href="/admin"
                className="flex items-center gap-1 text-secondary-fixed-dim hover:text-white font-bold uppercase tracking-wider text-[10px] sm:text-[11px] px-2 py-0.5 rounded hover:bg-white/10 transition-colors"
                title="കേരളദേശം എഡിറ്റോറിയൽ അഡ്മിൻ ലോഗിൻ"
              >
                <span>ADMIN</span>
              </Link>

              <div className="flex items-center gap-1 bg-ink-midnight/80 px-2 py-0.5 rounded border border-surface-pure/10">
                <span className="text-secondary-fixed-dim text-[10px] mr-0.5 hidden sm:inline uppercase tracking-wider font-semibold">
                  FONT:
                </span>
                {(['sm', 'md', 'lg'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => setFontSize(size)}
                    className={`px-1.5 py-0.5 text-[10px] sm:text-xs rounded transition-colors ${fontSize === size ? 'bg-primary text-white font-bold' : 'text-surface-pure hover:bg-secondary/40'
                      }`}
                  >
                    {size === 'sm' ? 'A-' : size === 'md' ? 'A' : 'A+'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Masthead (Screen < md) */}
        <div className="md:hidden flex flex-col items-center justify-center py-2 px-3 border-b border-slate-100 bg-surface-pure">
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
                className={`p-2 transition-colors relative rounded-full hover:bg-surface-container ${showAlertsDropdown ? 'text-primary bg-surface-container' : 'text-secondary hover:text-primary'
                  }`}
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 ? (
                  <span className="absolute -top-0.5 -right-0.5 bg-editorial-crimson text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center animate-pulse shadow-xs">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                ) : (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-slate-300" />
                )}
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
          <Link href="/" className="flex items-center justify-center group py-1" aria-label="കേരളദേശം">
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
            <nav className="flex w-full items-center justify-center gap-1 sm:gap-1.5 lg:gap-2 py-2 flex-nowrap min-w-max">
              {/* Category Nav Links */}
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`px-2.5 lg:px-3 py-1.5 rounded-md text-xs lg:text-[13px] font-semibold transition-colors whitespace-nowrap ${isActive
                      ? 'bg-primary text-white font-bold shadow-sm'
                      : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
                      }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              {/* Divider before Live TV */}
              <div className="h-4 w-px bg-slate-300 mx-1 shrink-0" />

              {/* Redesigned Premium Live TV Broadcast Button */}
              <button
                onClick={() => setLiveTvOpen(true)}
                className="relative group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-bold text-xs shadow-md shadow-red-500/30 hover:shadow-lg hover:shadow-red-600/50 hover:scale-105 active:scale-95 transition-all duration-200 border border-red-400/30 overflow-hidden shrink-0"
                title="Watch Live TV"
              >
                <span className="relative flex h-2.5 w-2.5 items-center justify-center shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                </span>
                <Radio className="w-3.5 h-3.5 text-white/95 group-hover:rotate-12 transition-transform shrink-0" />
                <span className="tracking-wide">LIVE TV</span>
                <span className="bg-black/25 backdrop-blur-xs text-[10px] font-black uppercase px-1.5 py-0.5 rounded text-white tracking-wider border border-white/20">
                  LIVE
                </span>
              </button>

              {/* Actions: Search, Notifications, Saved Stories */}
              <div className="flex items-center gap-1.5 shrink-0 ml-1">
                {/* Search Icon & Dropdown */}
                <div ref={searchContainerRef} className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const next = !searchOpen;
                      setSearchOpen(next);
                      if (next) setTimeout(() => searchInputRef.current?.focus(), 80);
                    }}
                    className={`p-2 lg:p-2.5 rounded-full transition-colors flex items-center justify-center ${searchOpen
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

                      {searchQuery.trim() && (
                        <div className="mt-2 pt-2 border-t border-slate-border max-h-80 overflow-y-auto">
                          <div className="flex justify-between items-center px-1 pb-1 text-[11px] text-secondary font-bold uppercase tracking-wider">
                            <span>ഫലങ്ങൾ ({searchResults.length})</span>
                          </div>
                          {searchResults.length === 0 ? (
                            <div className="p-3 text-xs text-secondary text-center">വാർത്തകൾ കണ്ടെത്താനായില്ല</div>
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

                {/* Notifications Bell Icon & Desktop Dropdown */}
                <div ref={alertsContainerRef} className="relative shrink-0">
                  <button
                    onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
                    className={`p-2 lg:p-2.5 rounded-full transition-colors relative flex items-center justify-center ${showAlertsDropdown
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-secondary hover:text-primary hover:bg-surface-container'
                      }`}
                    title="Notifications"
                    aria-label="Notifications"
                  >
                    <Bell className="w-[22px] h-[22px] lg:w-6 lg:h-6" />
                    {unreadCount > 0 ? (
                      <span className="absolute -top-0.5 -right-0.5 bg-editorial-crimson text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center animate-pulse shadow-xs">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    ) : (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-slate-400" />
                    )}
                  </button>

                  {/* Desktop Dropdown Popover */}
                  {showAlertsDropdown && (
                    <div className="hidden lg:block absolute right-0 top-full mt-2 z-50 animate-in fade-in slide-from-top-1 duration-150">
                      {renderNotificationPanel(false)}
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

        {/* Social Media Sub Navbar */}
        <div className="w-full bg-[#F1F3F6] border-y border-slate-200">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="min-h-[44px] flex items-center justify-start sm:justify-center gap-4 sm:gap-6 lg:gap-8 overflow-x-auto whitespace-nowrap no-scrollbar py-2">
              {/* Follow Us */}
              <span className="text-[11px] font-bold tracking-wider text-slate-500 shrink-0 border-r border-slate-300 pr-4 sm:pr-6">
                FOLLOW US
              </span>

              {/* Social Links */}
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Follow Kerala Desam on ${social.name}`}
                  className="group flex items-center gap-2 shrink-0 text-slate-700 hover:text-red-600 transition-colors"
                >
                  <span
                    className={`w-6 h-6 flex items-center justify-center rounded-full text-white ${social.bg} group-hover:scale-110 transition-transform shadow-2xs`}
                  >
                    {social.icon}
                  </span>
                  <span className="text-xs font-semibold">
                    {social.name === 'X (Twitter)' ? 'X' : social.name}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Premium Breaking News Banner */}
        <section className="bg-gradient-to-r from-[#7a0010] via-[#9e051c] to-[#6d000e] text-white border-y border-red-950/40 shadow-sm overflow-hidden select-none">
          <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-center sm:justify-start py-1.5 sm:py-0 sm:h-12 md:h-14 lg:h-16 px-4 sm:px-6 lg:px-8">
            {/* Breaking Label Badge */}
            <div className="flex shrink-0 items-center justify-center gap-1.5 sm:gap-2 md:gap-3 bg-[#4d000a] border border-red-400/30 px-2.5 sm:px-3 md:px-4 py-0.5 sm:py-1 md:py-1.5 rounded-full sm:rounded-md shadow-xs mx-auto sm:mx-0 sm:mr-3 md:mr-4 mb-1 sm:mb-0">
              <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-85" />
                <span className="relative inline-flex h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3 rounded-full bg-white" />
              </span>
              <p className="whitespace-nowrap text-xs md:text-sm font-black uppercase tracking-wider text-white">
                BREAKING NEWS
              </p>
            </div>

            {/* Live Headlines Ticker */}
            <div className="flex min-w-0 w-full sm:flex-1 items-center overflow-hidden h-7 sm:h-full">
              {breakingNews.length === 0 ? (
                <div className="flex items-center px-4 text-xs font-medium text-white/85 italic">
                  തത്സമയ ബ്രേക്കിംഗ് വാർത്തകൾക്കായി കാത്തിരിക്കുന്നു...
                </div>
              ) : (
                <div className="breaking-track flex w-max shrink-0 items-center">
                  {[0, 1, 2].map((copy) => (
                    <div key={copy} className="flex shrink-0 items-center" aria-hidden={copy !== 0}>
                      {breakingNews.map((item, idx) => {
                        const matched = findArticleForHeadline(item, notificationArticles);
                        const targetUrl = matched
                          ? `/article/${matched._id || matched.id || matched.customId}`
                          : `/search?q=${encodeURIComponent(item.trim())}`;

                        return (
                          <Link
                            key={`${copy}-${idx}-${item}`}
                            href={targetUrl}
                            tabIndex={copy !== 0 ? -1 : undefined}
                            className="shrink-0 whitespace-nowrap px-3 sm:px-5 md:px-7 text-xs sm:text-sm md:text-base font-bold text-white hover:text-red-100 flex items-center transition-colors"
                          >
                            <span className="inline-block w-2 h-2 rounded-full bg-red-300 mr-2 md:mr-3 shrink-0" />
                            {item}
                          </Link>
                        );
                      })}
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

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs lg:hidden pt-20 px-4">
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
                  className="w-full bg-surface-container-low rounded-lg py-2.5 pl-9 pr-8 text-xs font-medium text-on-surface border border-slate-border focus:outline-none focus:ring-1 focus:ring-primary"
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
                      className={`px-3 py-2 text-sm font-semibold rounded transition-colors ${isActive ? 'bg-primary text-white font-bold' : 'hover:bg-surface-container text-on-surface'
                        }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions & Social in Mobile Drawer */}
            <div className="pt-4 border-t border-slate-border mt-4 space-y-2.5">
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

              {/* Live TV Button */}
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

              {/* Admin Portal Button */}
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors border border-slate-border uppercase tracking-wider text-[11px]"
              >
                <span>എഡിറ്റോറിയൽ ലോഗിൻ (Admin)</span>
              </Link>

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

              {/* Mobile Social Links */}
              <div className="pt-2 flex items-center justify-center gap-2">
                {SOCIAL_LINKS.map((s) => (
                  <a
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={s.name}
                    className={`w-7 h-7 rounded-full ${s.bg} text-white flex items-center justify-center shadow-xs`}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Notifications Bottom Sheet Modal */}
      {showAlertsDropdown && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setShowAlertsDropdown(false)}
        >
          <div
            className="rounded-t-2xl shadow-2xl border-t border-slate-border overflow-hidden animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {renderNotificationPanel(true)}
          </div>
        </div>
      )}

      {/* Sub Modals */}
      <BookmarksDrawer isOpen={bookmarksOpen} onClose={() => setBookmarksOpen(false)} />
      <EPaperModal isOpen={ePaperOpen} onClose={() => setEPaperOpen(false)} />
      <LiveTvModal isOpen={liveTvOpen} onClose={() => setLiveTvOpen(false)} />
    </>
  );
}