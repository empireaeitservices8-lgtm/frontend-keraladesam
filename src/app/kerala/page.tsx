'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Clock,
  ArrowRight,
  Bookmark,
  Share2,
  Check,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Article, KERALA_DISTRICTS } from '@/data/newsData';
import { getRealArticles } from '@/lib/api';
import { useFont } from '@/components/FontContext';

export default function KeralaPage() {
  const { toggleBookmark, isBookmarked } = useFont();

  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Pagination state
  const ITEMS_PER_PAGE = 8;
  const [currentPage, setCurrentPage] = useState(1);

  // Slider refs and helper
  const districtsRef = useRef<HTMLDivElement>(null);
  const slideLeft = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollBy({ left: -240, behavior: 'smooth' });
    }
  };
  const slideRight = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollBy({ left: 240, behavior: 'smooth' });
    }
  };

  const categories = [
    { label: 'ALL', filter: 'ALL' },
    { label: 'POLITICS', filter: 'രാഷ്ട്രീയം' },
    { label: 'GOVERNANCE', filter: 'ഭരണം' },
    { label: 'EDUCATION', filter: 'വിദ്യാഭ്യാസം' },
    { label: 'CRIME & SAFETY', filter: 'ക്രൈം' },
    { label: 'DEVELOPMENT', filter: 'വികസനം' },
  ];

  React.useEffect(() => {
    let isMounted = true;
    async function loadArticles() {
      try {
        setLoading(true);
        const params: any = {};
        if (selectedDistrict !== 'All' && selectedDistrict !== 'എല്ലാം') params.district = selectedDistrict;
        if (selectedCategory !== 'ALL') {
          const match = categories.find((c) => c.label === selectedCategory);
          if (match) params.category = match.filter;
        }
        const data = await getRealArticles(params);
        if (isMounted) {
          setArticles(data);
        }
      } catch (e) {
        console.error('Error fetching kerala articles:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadArticles();
    return () => {
      isMounted = false;
    };
  }, [selectedDistrict, selectedCategory]);

  const handleShare = (e: React.MouseEvent, articleId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/article/${articleId}`;
      navigator.clipboard?.writeText(url);
      setCopiedId(articleId);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const filteredArticles = articles;
  const heroArticle = filteredArticles.length > 0 ? filteredArticles[0] : null;
  const gridArticles = filteredArticles.length > 1 ? filteredArticles.slice(1) : [];

  const totalPages = Math.max(1, Math.ceil(gridArticles.length / ITEMS_PER_PAGE));
  const paginatedGridArticles = gridArticles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      const gridEl = document.getElementById('kerala-secondary-grid');
      if (gridEl) {
        gridEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Section Header & Sub-Category Filter Strip */}
      <section className="w-full bg-surface-pure shadow-sm border-b border-slate-border">
        <div className="max-w-[1360px] mx-auto px-4 md:px-margin-desktop py-4">
          {/* Breadcrumb & Live Stamp */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs text-secondary">
            <div className="flex items-center gap-1.5 uppercase font-medium">
              <Link href="/" className="hover:text-primary transition-colors">
                HOME
              </Link>
              <span>/</span>
              <span className="text-editorial-crimson font-bold">KERALA</span>
              <span>/</span>
              <span className="text-on-surface">
                {selectedDistrict !== 'All' && selectedDistrict !== 'എല്ലാം' ? selectedDistrict : 'ALL DISTRICTS'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-secondary font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>വാർത്തകൾ: <strong className="text-ink-midnight">{filteredArticles.length}</strong></span>
            </div>
          </div>

          {/* Section Title & Sub-category Bar */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 md:gap-4 pb-2">
            <div className="flex items-baseline gap-2.5 sm:gap-3">
              <h1 className="font-headline text-2xl sm:text-3xl md:text-4xl text-ink-midnight font-bold tracking-tight">
                KERALA NEWS
              </h1>
            </div>

            {/* Category Navigation Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {categories.map((cat) => (
                <button
                  key={cat.label}
                  onClick={() => {
                    setSelectedCategory(cat.label);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1 text-xs rounded transition-all whitespace-nowrap font-medium ${selectedCategory === cat.label
                    ? 'bg-primary text-white font-bold shadow-sm'
                    : 'bg-surface-container-low text-on-surface hover:bg-surface-container-high'
                    }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* 14 District Quick Filter Pills Bar with Interactive Slider Controls */}
          <div className="pt-3 mt-1 border-t border-slate-border/60 flex items-center gap-2 relative">
            <div className="flex items-center gap-1 text-xs text-secondary shrink-0 pr-1 font-semibold uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5 text-editorial-crimson" />
              <span>DISTRICTS:</span>
            </div>

            {/* Left Scroll Button */}
            <button
              onClick={() => slideLeft(districtsRef)}
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-editorial-crimson hover:text-white border border-slate-200 flex items-center justify-center transition-colors text-slate-700 shadow-xs shrink-0"
              title="ഇടത്തേക്ക് നീക്കുക"
              aria-label="Scroll Left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Scrollable District Pills */}
            <div
              ref={districtsRef}
              className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth flex-1 py-1"
            >
              {['All', ...KERALA_DISTRICTS.filter(d => d !== 'എല്ലാം')].map((dist) => (
                <button
                  key={dist}
                  onClick={() => {
                    setSelectedDistrict(dist);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1 rounded-full text-xs transition-colors font-medium whitespace-nowrap shrink-0 ${selectedDistrict === dist
                    ? 'bg-ink-midnight text-white font-bold shadow-xs'
                    : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                    }`}
                >
                  {dist}
                </button>
              ))}
            </div>

            {/* Right Scroll Button */}
            <button
              onClick={() => slideRight(districtsRef)}
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-editorial-crimson hover:text-white border border-slate-200 flex items-center justify-center transition-colors text-slate-700 shadow-xs shrink-0"
              title="വലത്തേക്ക് നീക്കുക"
              aria-label="Scroll Right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Main District Content Grid */}
      <main className="w-full max-w-[1360px] mx-auto px-4 md:px-margin-desktop py-6">
        {loading ? (
          <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-xs font-semibold text-secondary">കേരള വാർത്തകൾ ലഭ്യമാക്കുന്നു...</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="bg-surface-pure rounded-xl p-10 sm:p-14 text-center border border-slate-border shadow-xs">
            <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-7 h-7 text-secondary" />
            </div>
            <h3 className="text-lg font-bold text-ink-midnight mb-2 font-headline uppercase">
              {selectedDistrict !== 'All' && selectedDistrict !== 'എല്ലാം'
                ? `NO STORIES IN ${selectedDistrict}`
                : 'NO KERALA STORIES FOUND'}
            </h3>
            <p className="text-xs text-secondary max-w-md mx-auto mb-5 leading-relaxed">
              ഈ സെക്ഷനിൽ പുതിയ വാർത്തകൾ ഇപ്പോൾ ലഭ്യമല്ല. ഡെസ്കിൽ നിന്ന് വാർത്തകൾ ഉടൻ അപ്‌ഡേറ്റ് ചെയ്യുന്നതാണ്.
            </p>
            <button
              onClick={() => {
                setSelectedDistrict('All');
                setSelectedCategory('ALL');
              }}
              className="px-4 py-2 rounded bg-primary text-white text-xs font-bold hover:bg-editorial-crimson transition-colors uppercase tracking-wider"
            >
              View All Kerala News
            </button>
          </div>
        ) : (
          <>
            {/* Featured / Hero Story */}
            {heroArticle && (
              <article className="bg-surface-pure rounded-xl p-4 sm:p-6 lg:p-7 shadow-sm border border-slate-border mb-8 group transition-all hover:shadow-md">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-center">
                  <Link
                    href={`/article/${heroArticle.id}`}
                    className="lg:col-span-7 overflow-hidden rounded-lg relative block aspect-[16/10] sm:aspect-[16/9]"
                  >
                    {heroArticle.imageUrl ? (
                      <img
                        src={heroArticle.imageUrl}
                        alt={heroArticle.title}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-6 border border-slate-border">
                        <span className="text-sm font-serif font-bold text-slate-400">
                          കേരളദേശം • {heroArticle.category}
                        </span>
                      </div>
                    )}
                    {heroArticle.readTime && (
                      <span className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded">
                        {heroArticle.readTime}
                      </span>
                    )}
                    <span className="absolute top-3 left-3 bg-editorial-crimson text-white text-[11px] font-bold px-2.5 py-0.5 rounded shadow-xs uppercase tracking-wider">
                      പ്രധാന വാർത്ത
                    </span>
                  </Link>

                  <div className="lg:col-span-5 flex flex-col justify-between h-full">
                    <div>
                      <div className="flex items-center justify-between text-xs text-secondary mb-2 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="font-bold uppercase tracking-wider text-[11px]"
                            style={{ color: heroArticle.categoryColor || '#C8102E' }}
                          >
                            {heroArticle.category}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="flex items-center gap-1 font-semibold text-ink-midnight">
                            <MapPin className="w-3.5 h-3.5 text-editorial-crimson" />
                            {heroArticle.district || 'കേരളം'}
                          </span>
                        </div>
                        <span className="flex items-center gap-1 text-slate-500">
                          <Clock className="w-3.5 h-3.5 text-slate-400" /> {heroArticle.timeAgo}
                        </span>
                      </div>

                      <Link href={`/article/${heroArticle.id}`}>
                        <h2 className="font-headline text-xl sm:text-2xl md:text-3xl font-bold text-ink-midnight group-hover:text-primary transition-colors leading-tight mb-3">
                          {heroArticle.title}
                        </h2>
                      </Link>

                      <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed line-clamp-3 sm:line-clamp-4 mb-4">
                        {heroArticle.lead}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-border flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {heroArticle.author?.avatar ? (
                          <img
                            src={heroArticle.author.avatar}
                            alt={heroArticle.author.name}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-border"
                          />
                        ) : null}
                        <span className="text-xs font-bold text-ink-midnight">
                          {heroArticle.author?.name || 'റിപ്പോർട്ടർ'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => handleShare(e, heroArticle.id)}
                          className="p-2 text-secondary hover:text-primary rounded-full hover:bg-surface-container transition-colors"
                          title={copiedId === heroArticle.id ? 'ലിങ്ക് പകർത്തി!' : 'പങ്കുവെക്കുക'}
                        >
                          {copiedId === heroArticle.id ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Share2 className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => toggleBookmark(heroArticle.id)}
                          className={`p-2 rounded-full hover:bg-surface-container transition-colors ${
                            isBookmarked(heroArticle.id)
                              ? 'text-primary fill-current'
                              : 'text-secondary hover:text-primary'
                          }`}
                          title="ബുക്ക്‌മാർക്ക്"
                        >
                          <Bookmark
                            className={`w-4 h-4 ${
                              isBookmarked(heroArticle.id) ? 'fill-primary' : ''
                            }`}
                          />
                        </button>
                        <Link
                          href={`/article/${heroArticle.id}`}
                          className="px-3.5 py-1.5 rounded bg-primary text-white text-xs font-bold hover:bg-editorial-crimson transition-colors flex items-center gap-1 shadow-xs ml-1"
                        >
                          Read More <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            )}

            {/* Secondary Stories Grid with Pagination */}
            {gridArticles.length > 0 && (
              <div id="kerala-secondary-grid" className="scroll-mt-24">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-200">
                  <h3 className="text-base sm:text-lg font-bold text-ink-midnight font-headline uppercase tracking-wide flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-editorial-crimson" />
                    മറ്റു പ്രധാന വാർത്തകൾ
                  </h3>
                  <span className="text-xs text-secondary font-medium">
                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, gridArticles.length)} of {gridArticles.length} stories
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
                  {paginatedGridArticles.map((article) => (
                    <article
                      key={article.id}
                      className="news-card group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-2.5 sm:p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                    >
                      <div className="flex flex-1 flex-col">
                        <Link
                          href={`/article/${article.id}`}
                          className="relative mb-2 sm:mb-3 overflow-hidden rounded-lg aspect-[16/10] sm:aspect-[16/9] block"
                        >
                          {article.imageUrl ? (
                            <img
                              src={article.imageUrl}
                              alt={article.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center p-2">
                              <span className="text-[10px] sm:text-xs font-serif font-bold text-slate-400">
                                കേരളദേശം
                              </span>
                            </div>
                          )}
                          {article.readTime && (
                            <span className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 bg-black/75 backdrop-blur-xs text-white text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded font-medium">
                              {article.readTime}
                            </span>
                          )}
                        </Link>

                        {/* Category & District & Time Meta */}
                        <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-secondary mb-1 sm:mb-1.5 gap-1 flex-wrap">
                          <span
                            className="font-bold uppercase tracking-wider text-[9px] sm:text-[10px] truncate max-w-[80px]"
                            style={{ color: article.categoryColor || '#C8102E' }}
                          >
                            {article.category}
                          </span>
                          <span className="flex items-center gap-1 text-slate-500 font-medium shrink-0">
                            <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                            {article.timeAgo}
                          </span>
                        </div>

                        {/* Headline */}
                        <Link href={`/article/${article.id}`}>
                          <h3 className="mb-1 sm:mb-2 line-clamp-2 sm:line-clamp-3 font-headline text-xs sm:text-base font-bold leading-snug sm:leading-snug text-ink-midnight transition-colors group-hover:text-primary">
                            {article.title}
                          </h3>
                        </Link>

                        {/* Lead Excerpt */}
                        <p className="mb-2 sm:mb-3 line-clamp-2 sm:line-clamp-3 text-[11px] sm:text-xs leading-relaxed text-on-surface-variant hidden sm:block">
                          {article.lead}
                        </p>
                      </div>

                      {/* Footer: District, Bookmark, Share, Read More */}
                      <div className="mt-auto flex items-center justify-between gap-1 border-t border-slate-100 pt-2 text-[10px] sm:text-xs text-secondary">
                        <span className="flex items-center gap-1 font-semibold text-ink-midnight text-[10px] sm:text-[11px] truncate max-w-[65px] sm:max-w-[120px]">
                          <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-editorial-crimson shrink-0" />
                          {article.district || 'കേരളം'}
                        </span>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={(e) => handleShare(e, article.id)}
                            className="p-1 text-secondary hover:text-primary rounded-full hover:bg-slate-100 transition-colors"
                            title={copiedId === article.id ? 'ലിങ്ക് പകർത്തി!' : 'പങ്കുവെക്കുക'}
                            aria-label="Share article"
                          >
                            {copiedId === article.id ? (
                              <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" />
                            ) : (
                              <Share2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => toggleBookmark(article.id)}
                            className="p-1 text-secondary hover:text-primary rounded-full hover:bg-slate-100 transition-colors"
                            title="ബുക്ക്‌മാർക്ക്"
                            aria-label="Bookmark article"
                          >
                            <Bookmark
                              className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${
                                isBookmarked(article.id) ? 'fill-primary text-primary' : ''
                              }`}
                            />
                          </button>
                          <Link
                            href={`/article/${article.id}`}
                            className="font-bold text-primary hover:underline flex items-center gap-0.5 text-xs ml-0.5"
                          >
                            <span className="hidden sm:inline">Read</span> <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <nav aria-label="Kerala news pagination" className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
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
                          pageNum === currentPage - 2 ||
                          pageNum === currentPage + 2
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
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
