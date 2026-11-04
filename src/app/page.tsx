'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import {
  Clock,
  Eye,
  Bookmark,
  Share2,
  ArrowRight,
  PlayCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Article, VideoItem } from '@/data/newsData';
import {
  getRealArticles,
  getRealVideos,
  deduplicateArticles,
  getCachedData,
  getRealPhotoStory,
  PhotoStoryItem,
  DEFAULT_PHOTO_STORY,
} from '@/lib/api';
import { useFont } from '@/components/FontContext';
import VideoPlayerModal from '@/components/VideoPlayerModal';

export default function HomePage() {
  const { toggleBookmark, isBookmarked } = useFont();

  const [mounted, setMounted] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [photoStory, setPhotoStory] = useState<PhotoStoryItem>(DEFAULT_PHOTO_STORY);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const videosSliderRef = useRef<HTMLDivElement>(null);
  const photoSliderRef = useRef<HTMLDivElement>(null);
  const categoriesStripRef = useRef<HTMLDivElement>(null);

  const ITEMS_PER_PAGE = 8;

  const categoriesList = [
    { label: 'ALL', filter: 'ALL' },
    { label: 'KERALA', filter: 'kerala' },
    { label: 'INTERNATIONAL', filter: 'world' },
    { label: 'SPECIAL REPORTS', filter: 'special' },
    { label: 'POLITICS', filter: 'politics' },
    { label: 'BUSINESS', filter: 'business' },
    { label: 'CINEMA', filter: 'cinema' },
  ];

  const slideLeft = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollBy({ left: -280, behavior: 'smooth' });
    }
  };

  const slideRight = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollBy({ left: 280, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    let isMounted = true;
    setMounted(true);

    // 1. Immediately hydrate from client-side memory/session cache on mount
    const cachedArticles =
      getCachedData<Article[]>('articles_all___def_f') ||
      getCachedData<Article[]>('articles_all___50_f');
    if (cachedArticles && cachedArticles.length > 0) {
      setArticles(deduplicateArticles(cachedArticles));
      setLoading(false);
    }

    const cachedVideos = getCachedData<VideoItem[]>('videos_all_20');
    if (cachedVideos && cachedVideos.length > 0) {
      setVideos(cachedVideos);
    }

    const cachedPhotoStory = getCachedData<PhotoStoryItem>('photo_story_active');
    if (cachedPhotoStory) {
      setPhotoStory(cachedPhotoStory);
    }

    // 2. Fetch fresh data from backend
    async function loadData() {
      try {
        const [articlesResult, videosResult, photoStoryResult] = await Promise.allSettled([
          getRealArticles(),
          getRealVideos(),
          getRealPhotoStory(),
        ]);
        if (isMounted) {
          if (articlesResult.status === 'fulfilled' && articlesResult.value && articlesResult.value.length > 0) {
            setArticles(deduplicateArticles(articlesResult.value));
          }
          if (videosResult.status === 'fulfilled' && videosResult.value && videosResult.value.length > 0) {
            setVideos(videosResult.value);
          }
          if (photoStoryResult.status === 'fulfilled' && photoStoryResult.value) {
            setPhotoStory(photoStoryResult.value);
          }
        }
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();

    const handlePhotoStoryUpdate = () => {
      getRealPhotoStory().then((data) => {
        if (data && isMounted) setPhotoStory(data);
      }).catch(console.error);
    };
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'kd_photo_story' && e.newValue && isMounted) {
        try {
          setPhotoStory(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener('kd_photo_story_updated', handlePhotoStoryUpdate);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      isMounted = false;
      window.removeEventListener('kd_photo_story_updated', handlePhotoStoryUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Pinned headline article takes hero spot; otherwise newest article
  const heroArticle = articles.find((a) => a.isHeadline) || articles[0] || null;
  const remainingArticles = useMemo(() => {
    if (!heroArticle) return articles.slice(1);
    const heroTitleNorm = (heroArticle.title || '').trim().toLowerCase();
    const heroId = heroArticle.id || heroArticle._id;
    return articles.filter((a) => {
      if (heroId && (a.id === heroId || a._id === heroId)) return false;
      if (heroTitleNorm && (a.title || '').trim().toLowerCase() === heroTitleNorm) return false;
      return true;
    });
  }, [articles, heroArticle]);

  // Filter remaining articles by selected category (matches navbar sections)
  const filteredRemaining = useMemo(() => {
    if (selectedCategory === 'ALL' || selectedCategory === 'all') return deduplicateArticles(remainingArticles);

    const filtered = remainingArticles.filter((a) => {
      const cat = (a.category || '').toLowerCase();
      const dist = (a.district || '').toLowerCase();

      if (selectedCategory === 'kerala') {
        return (
          dist !== 'ദേശീയം' &&
          dist !== 'അന്തർദേശീയം' &&
          dist !== 'പ്രവാസം / ഗൾഫ്' &&
          !cat.includes('ലോകം') &&
          !cat.includes('world') &&
          !cat.includes('international')
        );
      }
      if (selectedCategory === 'world' || selectedCategory === 'international' || selectedCategory === 'internatioanl') {
        return (
          cat.includes('ലോകം') ||
          cat.includes('ആഗോള') ||
          cat.includes('അന്താരാഷ്ട്ര') ||
          cat.includes('അന്തർദേശീയ') ||
          cat.includes('world') ||
          cat.includes('international') ||
          dist === 'അന്തർദേശീയം' ||
          dist === 'അന്താരാഷ്ട്രം'
        );
      }
      if (selectedCategory === 'special' || selectedCategory === 'special reports') {
        return (
          cat.includes('പ്രത്യേക') ||
          cat.includes('അന്വേഷണ') ||
          cat.includes('special') ||
          cat.includes('feature') ||
          Boolean(a.breaking || a.tags?.some((t) => t.toLowerCase().includes('special')))
        );
      }
      if (selectedCategory === 'politics') {
        return (
          cat.includes('രാഷ്ട്രീയ') ||
          cat.includes('ഭരണം') ||
          cat.includes('നിയമസഭ') ||
          cat.includes('politic')
        );
      }
      if (selectedCategory === 'business' || selectedCategory === 'bussiness') {
        return (
          cat.includes('ബിസിനസ്') ||
          cat.includes('സമ്പദ്') ||
          cat.includes('വികസന') ||
          cat.includes('business') ||
          cat.includes('economy')
        );
      }
      if (selectedCategory === 'cinema') {
        return (
          cat.includes('സിനിമ') ||
          cat.includes('കല') ||
          cat.includes('entertainment') ||
          cat.includes('cinema') ||
          cat.includes('film')
        );
      }
      return true;
    });

    return deduplicateArticles(filtered);
  }, [remainingArticles, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredRemaining.length / ITEMS_PER_PAGE));
  const paginatedArticles = filteredRemaining.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const handleCategorySelect = (filterKey: string) => {
    setSelectedCategory(filterKey);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      const gridEl = document.getElementById('latest-stories');
      if (gridEl) {
        gridEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleShare = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(window.location.origin + `/article/${id}`);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  if (!mounted) {
    return (
      <div className="flex flex-col w-full pb-16">
        <main className="w-full max-w-[1360px] mx-auto px-3 sm:px-5 lg:px-8 py-4 sm:py-6 md:py-8">
          <div className="bg-surface-pure rounded-lg p-10 border border-slate-border flex flex-col items-center justify-center text-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm font-semibold text-slate-700">ഡാറ്റാബേസിൽ നിന്ന് തത്സമയ വാർത്തകൾ ലഭ്യമാക്കുന്നു...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Main Editorial Centered Layout */}
      <main className="w-full max-w-[1360px] mx-auto px-3 sm:px-5 lg:px-8 py-4 sm:py-6 md:py-8">
        <div className="flex flex-col gap-6 sm:gap-8">
          {/* Loading State or Hero Article */}
          {loading && !heroArticle ? (
            <div className="bg-surface-pure rounded-lg p-10 border border-slate-border flex flex-col items-center justify-center text-center gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm font-semibold text-slate-700">ഡാറ്റാബേസിൽ നിന്ന് തത്സമയ വാർത്തകൾ ലഭ്യമാക്കുന്നു...</p>
            </div>
          ) : !heroArticle ? (
            <div className="bg-surface-pure rounded-lg p-10 border border-slate-border text-center">
              <p className="text-sm font-semibold text-slate-700">നിലവിൽ വാർത്തകൾ ലഭ്യമല്ല. ദയവായി അല്പം കഴിഞ്ഞ് വീണ്ടും പരിശോധിക്കുക.</p>
            </div>
          ) : (
            /* Lead Broadsheet Hero Article (Main Headline) */
            <article className="bg-surface-pure rounded-xl p-3.5 sm:p-5 md:p-6 shadow-sm border border-slate-border relative group overflow-hidden">
              {/* Category & Badge */}
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">
                  LEAD EDITORIAL
                </span>

                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={(e) => handleShare(e, heroArticle.id)}
                    className="p-1.5 text-secondary hover:text-primary transition-colors rounded-full hover:bg-surface-container"
                    title="പങ്കുവെക്കുക"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleBookmark(heroArticle.id)}
                    className={`p-1.5 transition-colors rounded-full hover:bg-surface-container ${isBookmarked(heroArticle.id)
                        ? 'text-primary fill-current'
                        : 'text-secondary hover:text-primary'
                      }`}
                    title="ബുക്ക്‌മാർക്ക് ചെയ്യുക"
                  >
                    <Bookmark
                      className={`w-4 h-4 ${isBookmarked(heroArticle.id) ? 'fill-primary' : ''
                        }`}
                    />
                  </button>
                </div>
              </div>

              {/* Hero editorial layout */}
              <div className={`grid grid-cols-1 ${heroArticle.imageUrl ? 'lg:grid-cols-2' : ''} gap-4 sm:gap-6 lg:gap-8 items-center`}>
                {/* Headline and summary */}
                <div className={`flex flex-col ${heroArticle.imageUrl ? 'order-2 lg:order-1' : ''} justify-center`}>
                  <Link href={`/article/${heroArticle.id}`}>
                    <h1 className="newspaper-lead text-xl sm:text-2xl md:text-3xl lg:text-4xl text-ink-midnight font-bold leading-snug sm:leading-tight hover:text-primary transition-colors mb-3 sm:mb-4">
                      {heroArticle.title}
                    </h1>
                  </Link>

                  <p className="text-xs sm:text-sm md:text-base text-slate-700 leading-relaxed sm:leading-8 mb-4 sm:mb-5">
                    {heroArticle.lead}
                  </p>

                  <div className="flex items-center gap-2 sm:gap-3 text-xs text-secondary mb-4 sm:mb-5">
                    <span className="font-semibold">{heroArticle.author.name}</span>
                    <span>•</span>
                    <span>{heroArticle.timeAgo}</span>
                  </div>

                  <Link
                    href={`/article/${heroArticle.id}`}
                    className="inline-flex w-fit items-center gap-2 rounded-md bg-primary px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-editorial-crimson transition-colors shadow-sm"
                  >
                    Read Full Story
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Right: Lead image (only if image exists) */}
                {heroArticle.imageUrl && (
                  <Link
                    href={`/article/${heroArticle.id}`}
                    className="order-1 lg:order-2 block overflow-hidden rounded-lg"
                  >
                    <img
                      src={heroArticle.imageUrl}
                      alt={heroArticle.title}
                      className="w-full h-full min-h-[200px] sm:min-h-[280px] max-h-[380px] sm:max-h-[420px] aspect-[16/10] object-cover transition-transform duration-500 hover:scale-[1.02]"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </Link>
                )}
              </div>

              {copiedId === heroArticle.id && (
                <div className="absolute top-4 right-16 bg-ink-midnight text-white text-xs px-3 py-1.5 rounded shadow-lg animate-in fade-in">
                  Link copied to clipboard!
                </div>
              )}
            </article>
          )}

          {/* Sliding Effect 1: Smooth Horizontal Sliding Category Strip with Interactive Controls */}
          <div className="w-full flex items-center gap-1.5 py-1 border-y border-slate-200/80 relative">
            <button
              onClick={() => slideLeft(categoriesStripRef)}
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-editorial-crimson hover:text-white border border-slate-200 flex items-center justify-center transition-colors text-slate-700 shadow-xs shrink-0"
              title="ഇടത്തേക്ക് നീക്കുക"
              aria-label="Scroll Left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div
              ref={categoriesStripRef}
              className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth flex-1 py-1"
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-secondary mr-1 flex items-center gap-1 shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-editorial-crimson" />
                SECTIONS:
              </span>
              {categoriesList.map((cat) => (
                <button
                  key={cat.filter}
                  onClick={() => handleCategorySelect(cat.filter)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${selectedCategory === cat.filter
                      ? 'bg-primary text-white shadow-xs font-bold scale-105'
                      : 'bg-surface-pure hover:bg-surface-container-high text-on-surface border border-slate-200/80'
                    }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => slideRight(categoriesStripRef)}
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-editorial-crimson hover:text-white border border-slate-200 flex items-center justify-center transition-colors text-slate-700 shadow-xs shrink-0"
              title="വലത്തേക്ക് നീക്കുക"
              aria-label="Scroll Right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Section Header for Latest News with Pagination */}
          <div id="latest-stories" className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-4 border-b border-slate-200 pb-3 pt-2 scroll-mt-24">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-primary">
                  LATEST HEADLINES
                </span>
              </div>
              <h2 className="font-headline text-2xl sm:text-3xl font-bold text-ink-midnight tracking-tight">
                പ്രധാന വാർത്തകൾ
              </h2>
              <p className="text-xs sm:text-sm text-secondary mt-0.5">
                Continuous live dispatches and breaking reports from across Kerala and the world
              </p>
            </div>
            {filteredRemaining.length > 0 && (
              <div className="text-xs text-secondary font-medium">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredRemaining.length)} of {filteredRemaining.length} stories
              </div>
            )}
          </div>

          {/* Mobile View: 2 cards per row (grid-cols-2), Responsive across tablet & desktop */}
          {loading && paginatedArticles.length === 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
              {[...Array(8)].map((_, idx) => (
                <div key={idx} className="bg-surface-pure rounded-xl p-3 border border-slate-200 animate-pulse flex flex-col gap-2">
                  <div className="w-full aspect-[16/10] bg-slate-200 rounded-lg" />
                  <div className="h-4 bg-slate-200 rounded w-4/5 mt-1" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : paginatedArticles.length === 0 ? (
            <div className="bg-surface-pure rounded-xl p-8 border border-slate-200 text-center text-secondary text-sm">
              കൂടുതൽ വാർത്തകൾ ലഭ്യമല്ല.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
              {paginatedArticles.map((item) => (
                <article
                  key={item.id}
                  className="news-card group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-2.5 sm:p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex flex-1 flex-col">
                    <Link
                      href={`/article/${item.id}`}
                      className="relative mb-2 sm:mb-3 overflow-hidden rounded-lg aspect-[16/10] sm:aspect-[16/9] block"
                    >
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.parentElement?.querySelector('.fallback-card') as HTMLElement;
                            if (fallback) fallback.classList.remove('hidden');
                          }}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : null}
                      <div className={`fallback-card w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center p-2 ${item.imageUrl ? 'hidden' : ''}`}>
                        <span className="text-[10px] sm:text-xs font-serif font-bold text-slate-400">
                          കേരളദേശം
                        </span>
                      </div>
                    </Link>

                    <Link href={`/article/${item.id}`}>
                      <h3 className="mb-1 sm:mb-2 line-clamp-2 sm:line-clamp-3 font-headline text-xs sm:text-base font-bold leading-snug sm:leading-snug text-ink-midnight transition-colors group-hover:text-primary">
                        {item.title}
                      </h3>
                    </Link>

                    <p className="mb-2 sm:mb-3 line-clamp-2 sm:line-clamp-3 text-[11px] sm:text-xs leading-relaxed text-on-surface-variant hidden xs:line-clamp-2">
                      {item.lead}
                    </p>
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-1 sm:gap-2 border-t border-slate-100 pt-2 text-[10px] sm:text-xs text-secondary">
                    <span className="truncate flex items-center gap-1 font-medium text-slate-500" title={`അപ്‌ലോഡ് ചെയ്ത സമയം: ${item.timeAgo}`}>
                      <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                      {item.timeAgo}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => toggleBookmark(item.id)}
                        className="p-1 text-secondary hover:text-primary rounded-full hover:bg-slate-100 transition-colors"
                        title="ബുക്ക്‌മാർക്ക്"
                      >
                        <Bookmark
                          className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isBookmarked(item.id) ? 'fill-primary text-primary' : ''
                            }`}
                        />
                      </button>
                      <Link
                        href={`/article/${item.id}`}
                        className="font-bold text-primary hover:underline flex items-center gap-0.5"
                      >
                        <span className="hidden sm:inline">Read</span> <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <nav aria-label="Page navigation" className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs text-secondary font-medium order-2 sm:order-1">
                Page <span className="font-bold text-ink-midnight">{currentPage}</span> of <span className="font-bold text-ink-midnight">{totalPages}</span>
              </div>

              <div className="flex items-center gap-1.5 order-1 sm:order-2 flex-wrap justify-center">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${currentPage === 1
                      ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400'
                      : 'bg-white border border-slate-200 text-ink-midnight hover:bg-slate-50 hover:border-slate-300 active:scale-95'
                    }`}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Previous
                </button>

                {/* Page Numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                  if (
                    totalPages <= 7 ||
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    Math.abs(pageNum - currentPage) <= 1
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`min-w-[34px] h-[34px] px-2.5 rounded-lg text-xs font-bold transition-all ${currentPage === pageNum
                            ? 'bg-primary text-white shadow-sm'
                            : 'bg-white border border-slate-200 text-ink-midnight hover:bg-slate-50 hover:border-slate-300'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    (pageNum === 2 && currentPage > 3) ||
                    (pageNum === totalPages - 1 && currentPage < totalPages - 2)
                  ) {
                    return (
                      <span key={pageNum} className="px-1 text-slate-400 text-xs">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${currentPage === totalPages
                      ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400'
                      : 'bg-white border border-slate-200 text-ink-midnight hover:bg-slate-50 hover:border-slate-300 active:scale-95'
                    }`}
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </nav>
          )}

          {/* Sliding Effect 3: Visual Journalism / Photo Feature Gallery with swipeable mobile slide */}
          <div className="bg-ink-midnight text-surface-pure rounded-xl p-4 sm:p-7 relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-[11px] bg-opinion-ochre text-white px-2.5 py-1 rounded font-bold uppercase tracking-wider">
                  {photoStory.tagLabel || 'PHOTO STORY'}
                </span>
                <span className="text-xs text-secondary-fixed-dim uppercase tracking-wider font-semibold">
                  {photoStory.subtitle || 'KERALA IN FRAMES'}
                </span>
              </div>

              {/* Slider Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => slideLeft(photoSliderRef)}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-colors"
                  title="മുമ്പത്തെ ഫോട്ടോ"
                  aria-label="Previous Photo"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => slideRight(photoSliderRef)}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-colors"
                  title="അടുത്ത ഫോട്ടോ"
                  aria-label="Next Photo"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <h3 className="font-headline text-xl sm:text-2xl font-bold mb-2 text-surface-pure">
              {photoStory.title}
            </h3>
            <p className="text-xs sm:text-sm text-secondary-fixed-dim mb-4 leading-relaxed max-w-2xl">
              {photoStory.description}
            </p>

            {/* Mobile swipeable slider, desktop 3-col grid */}
            <div
              ref={photoSliderRef}
              className={`flex sm:grid ${(photoStory.images?.length || 3) <= 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'} gap-3 overflow-x-auto sm:overflow-visible no-scrollbar scroll-smooth snap-x snap-mandatory pb-2 sm:pb-0`}
            >
              {(photoStory.images && photoStory.images.length > 0
                ? photoStory.images
                : DEFAULT_PHOTO_STORY.images
              ).map((img, idx) => (
                <div key={idx} className="w-[260px] sm:w-auto shrink-0 snap-start overflow-hidden rounded-lg group relative">
                  <img
                    src={img.url}
                    alt={img.caption || `Photo ${idx + 1}`}
                    className="rounded-lg object-cover h-40 sm:h-44 w-full group-hover:scale-105 transition-transform duration-300"
                  />
                  {img.caption && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-2 text-[11px] text-white/90 truncate font-medium">
                      {img.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sliding Effect 4: Video Shorts & Reels Horizontal Sliding Carousel */}
          {videos.length > 0 && (
            <section id="videos" className="bg-surface-pure rounded-xl p-4 sm:p-6 border border-slate-border shadow-xs scroll-mt-24">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-border">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-live-alert animate-ping" />
                  <h3 className="font-headline text-base sm:text-lg md:text-xl font-bold text-ink-midnight flex items-center gap-1.5 uppercase tracking-wide">
                    <PlayCircle className="w-5 h-5 text-editorial-crimson" />
                    VIDEO SHORTS ({videos.length})
                  </h3>
                </div>

                {/* Slider Controls */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => slideLeft(videosSliderRef)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-editorial-crimson hover:text-white border border-slate-200 flex items-center justify-center transition-colors text-slate-700 shadow-xs"
                    title="മുമ്പത്തെ വീഡിയോകൾ"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => slideRight(videosSliderRef)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-editorial-crimson hover:text-white border border-slate-200 flex items-center justify-center transition-colors text-slate-700 shadow-xs"
                    title="അടുത്ത വീഡിയോകൾ"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Swipeable Horizontal Shorts Track */}
              <div
                ref={videosSliderRef}
                className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-1 px-0.5"
              >
                {videos.map((vid) => (
                  <div
                    key={vid.id || vid._id}
                    onClick={() => setSelectedVideo(vid)}
                    className="w-[155px] sm:w-[200px] shrink-0 snap-start group relative rounded-xl overflow-hidden bg-black aspect-[9/15] flex flex-col justify-end p-2.5 sm:p-3 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
                  >
                    <img
                      src={vid.thumbnail}
                      alt={vid.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 group-hover:opacity-90 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />

                    {/* Play icon overlay */}
                    <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/60 backdrop-blur flex items-center justify-center text-white group-hover:bg-editorial-crimson transition-colors shadow">
                      <PlayCircle className="w-4 h-4 fill-white/20" />
                    </div>

                    {/* Title */}
                    <h4 className="relative z-10 text-xs sm:text-sm font-bold text-white leading-snug line-clamp-2 mb-1.5 sm:mb-2 group-hover:text-amber-300 transition-colors">
                      {vid.title}
                    </h4>

                    {/* View count & Duration */}
                    <div className="relative z-10 flex items-center justify-between text-[10px] text-slate-300 border-t border-white/10 pt-1.5">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3 text-amber-400" /> {vid.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" /> {vid.duration}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Video Player Modal */}
          <VideoPlayerModal
            video={selectedVideo}
            isOpen={!!selectedVideo}
            onClose={() => setSelectedVideo(null)}
          />
        </div>
      </main>
    </div>
  );
}

