'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Clock,
  Eye,
  Bookmark,
  Share2,
  ArrowRight,
  Filter,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Check,
} from 'lucide-react';
import { Article } from '@/data/newsData';
import { getRealArticles, deduplicateArticles } from '@/lib/api';
import { useFont } from '@/components/FontContext';

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);

  // Sync state if searchParams in URL change
  React.useEffect(() => {
    const currentQ = searchParams.get('q') || '';
    setQuery(currentQ);
  }, [searchParams]);

  // Pagination state
  const ITEMS_PER_PAGE = 9;
  const [currentPage, setCurrentPage] = useState(1);

  const { toggleBookmark, isBookmarked } = useFont();

  const categories = [
    { label: 'ALL', filter: '' },
    { label: 'KERALA', filter: 'കേരള' },
    { label: 'INTERNATIONAL', filter: 'ലോകം' },
    { label: 'POLITICS', filter: 'രാഷ്ട്രീയം' },
    { label: 'BUSINESS', filter: 'ബിസിനസ്' },
    { label: 'CINEMA', filter: 'സിനിമ' },
    { label: 'SPORTS', filter: 'സ്പോർട്സ്' },
    { label: 'SPECIAL', filter: 'പ്രത്യേക' },
  ];

  React.useEffect(() => {
    let isMounted = true;
    async function doSearch() {
      try {
        setLoading(true);
        const data = await getRealArticles({ search: query.trim() || undefined });
        if (isMounted) {
          setArticles(data);
          setCurrentPage(1);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    const timer = setTimeout(doSearch, 250);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [query]);

  const results = useMemo(() => {
    let list = articles;
    if (selectedCategory !== 'ALL') {
      const catObj = categories.find((c) => c.label === selectedCategory);
      if (catObj && catObj.filter) {
        list = articles.filter((item) =>
          item.category.toLowerCase().includes(catObj.filter.toLowerCase()) ||
          item.tags?.some((t) => t.toLowerCase().includes(selectedCategory.toLowerCase()))
        );
      }
    }
    return deduplicateArticles(list);
  }, [articles, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(results.length / ITEMS_PER_PAGE));
  const paginatedResults = results.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      const gridEl = document.getElementById('search-results-grid');
      if (gridEl) {
        gridEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleShare = (e: React.MouseEvent, articleId: string) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/article/${articleId}`;
      navigator.clipboard.writeText(url);
      setCopiedId(articleId);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  return (
    <div className="flex flex-col w-full pb-16 bg-[#fbfbfb]">
      {/* Search Header Banner */}
      <section className="w-full bg-ink-midnight text-white py-10 px-4 md:px-margin-desktop border-b border-slate-border">
        <div className="max-w-[1360px] mx-auto">
          <div className="flex items-center gap-2 text-xs text-white/70 mb-3 uppercase tracking-wider font-medium">
            <Link href="/" className="hover:underline">
              HOME
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-bold text-white">SEARCH</span>
          </div>

          <h1 className="font-headline text-3xl sm:text-4xl font-bold tracking-tight mb-4 uppercase">
            SEARCH NEWS
          </h1>

          {/* Search Input Box */}
          <div className="relative max-w-2xl">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles by headline, keyword, or district..."
              className="w-full bg-white text-ink-midnight pl-11 pr-4 py-3 rounded-xl text-sm font-medium shadow-md border-0 focus:ring-2 focus:ring-primary focus:outline-none"
            />
            <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-secondary" />
          </div>

          {/* Category Chips */}
          <div className="mt-4 flex items-center gap-2 overflow-x-auto no-scrollbar pt-2">
            <span className="text-xs text-white/70 mr-1 shrink-0 uppercase tracking-wider font-bold">CATEGORIES:</span>
            {categories.map((cat) => (
              <button
                key={cat.label}
                onClick={() => setSelectedCategory(cat.label)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors whitespace-nowrap ${
                  selectedCategory === cat.label
                    ? 'bg-editorial-crimson text-white shadow-xs'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <main className="max-w-[1360px] mx-auto px-4 md:px-margin-desktop py-8 w-full">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-border text-xs sm:text-sm text-secondary">
          <span>
            {query.trim() ? (
              <>
                Results for &quot;<strong className="text-ink-midnight">{query}</strong>&quot;:{' '}
                <strong className="text-primary font-bold">{results.length} stories</strong>
              </>
            ) : (
              <>
                Total Available Stories:{' '}
                <strong className="text-primary font-bold">{results.length}</strong>
              </>
            )}
          </span>
        </div>

        {/* Results Grid with Pagination */}
        <div id="search-results-grid" className="scroll-mt-24">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
            {paginatedResults.map((article) => (
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
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center p-2">
                      <span className="text-[10px] sm:text-xs font-serif font-bold text-slate-400">
                        KERALA DESAM
                      </span>
                    </div>
                  )}
                </Link>

                <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-secondary mb-1 sm:mb-1.5 gap-1 flex-wrap">
                  <span className="font-medium flex items-center gap-1 text-slate-500">
                    <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                    {article.timeAgo}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" /> {article.views}
                  </span>
                </div>

                <Link href={`/article/${article.id}`}>
                  <h3 className="mb-1 sm:mb-2 line-clamp-2 sm:line-clamp-3 font-headline text-xs sm:text-base font-bold leading-snug sm:leading-snug text-ink-midnight transition-colors group-hover:text-primary">
                    {article.title}
                  </h3>
                </Link>

                <p className="mb-2 sm:mb-3 line-clamp-2 sm:line-clamp-3 text-[11px] sm:text-xs leading-relaxed text-on-surface-variant hidden sm:block">
                  {article.lead}
                </p>
              </div>

              <div className="mt-auto flex items-center justify-between gap-1 border-t border-slate-100 pt-2 text-[10px] sm:text-xs text-secondary">
                <span className="font-semibold text-ink-midnight text-[10px] sm:text-[11px] truncate max-w-[65px] sm:max-w-[120px]">
                  {article.author.name}
                </span>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => handleShare(e, article.id)}
                    className="p-1 text-secondary hover:text-primary rounded-full hover:bg-slate-100 transition-colors"
                    title="പങ്കുവെക്കുക"
                  >
                    <Share2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </button>
                  <button
                    onClick={() => toggleBookmark(article.id)}
                    className={`p-1 rounded-full hover:bg-slate-100 transition-colors ${
                      isBookmarked(article.id)
                        ? 'text-primary fill-current'
                        : 'text-secondary hover:text-primary'
                    }`}
                    title="ബുക്ക്‌മാർക്ക്"
                  >
                    <Bookmark
                      className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${
                        isBookmarked(article.id) ? 'fill-primary' : ''
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
          <nav aria-label="Search results pagination" className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs text-secondary font-medium order-2 sm:order-1">
              Showing <span className="font-bold text-ink-midnight">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span>–<span className="font-bold text-ink-midnight">{Math.min(currentPage * ITEMS_PER_PAGE, results.length)}</span> of <span className="font-bold text-ink-midnight">{results.length}</span> stories (Page {currentPage} of {totalPages})
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

        {results.length === 0 && (
          <div className="bg-surface-pure rounded-xl p-12 text-center border border-slate-border my-8">
            <Search className="w-12 h-12 text-secondary/60 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-ink-midnight mb-2 uppercase tracking-wide">
              NO RESULTS FOUND
            </h3>
            <p className="text-xs sm:text-sm text-secondary max-w-md mx-auto mb-5 leading-relaxed">
              നിങ്ങൾ നൽകിയ വാക്കുകളുമായി പൊരുത്തപ്പെടുന്ന വാർത്തകൾ നിലവിൽ ലഭ്യമല്ല. മറ്റ് വാക്കുകൾ നൽകി തിരയുക.
            </p>
            <button
              onClick={() => {
                setQuery('');
                setSelectedCategory('ALL');
              }}
              className="px-4 py-2 bg-primary text-white text-xs font-bold rounded shadow-xs hover:bg-editorial-crimson transition-colors uppercase tracking-wider"
            >
              View All Stories
            </button>
          </div>
        )}

        {copiedId && (
          <div className="fixed bottom-6 right-6 bg-ink-midnight text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-xl z-50 animate-in fade-in">
            Link copied!
          </div>
        )}
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">തിരയുന്നു...</div>}>
      <SearchContent />
    </Suspense>
  );
}
