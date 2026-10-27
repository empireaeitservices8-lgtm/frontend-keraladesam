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
  ChevronRight
} from 'lucide-react';
import { Article } from '@/data/newsData';
import { getRealArticles } from '@/lib/api';
import { useFont } from '@/components/FontContext';

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);

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
    if (selectedCategory === 'ALL') return articles;
    const catObj = categories.find((c) => c.label === selectedCategory);
    if (!catObj || !catObj.filter) return articles;
    return articles.filter((item) =>
      item.category.toLowerCase().includes(catObj.filter.toLowerCase()) ||
      item.tags?.some((t) => t.toLowerCase().includes(selectedCategory.toLowerCase()))
    );
  }, [articles, selectedCategory]);

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

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((article) => (
            <article
              key={article.id}
              className="bg-surface-pure rounded-xl p-4 sm:p-5 border border-slate-border shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <Link
                  href={`/article/${article.id}`}
                  className="block overflow-hidden rounded-lg mb-3.5 relative"
                >
                  {article.imageUrl ? (
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-44 bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center p-3">
                      <span className="text-xs font-serif font-bold text-slate-400">
                        KERALA DESAM NEWS
                      </span>
                    </div>
                  )}
                </Link>

                <div className="flex items-center justify-between text-[11px] text-secondary mb-2">
                  <span>{article.timeAgo}</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" /> {article.views}
                  </span>
                </div>

                <Link href={`/article/${article.id}`}>
                  <h3 className="font-headline text-base sm:text-lg font-bold text-ink-midnight group-hover:text-primary transition-colors leading-snug mb-2 line-clamp-2">
                    {article.title}
                  </h3>
                </Link>

                <p className="text-xs text-on-surface-variant line-clamp-3 leading-relaxed mb-4">
                  {article.lead}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-border flex items-center justify-between text-xs">
                <span className="font-semibold text-ink-midnight truncate max-w-[140px]">
                  {article.author.name}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => handleShare(e, article.id)}
                    className="p-1.5 text-secondary hover:text-primary rounded-full hover:bg-surface-container"
                    title="പങ്കുവെക്കുക"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => toggleBookmark(article.id)}
                    className={`p-1.5 rounded-full hover:bg-surface-container ${
                      isBookmarked(article.id)
                        ? 'text-primary fill-current'
                        : 'text-secondary hover:text-primary'
                    }`}
                    title="ബുക്ക്‌മാർക്ക്"
                  >
                    <Bookmark
                      className={`w-3.5 h-3.5 ${
                        isBookmarked(article.id) ? 'fill-primary' : ''
                      }`}
                    />
                  </button>
                  <Link
                    href={`/article/${article.id}`}
                    className="text-primary hover:underline font-bold ml-1 flex items-center gap-0.5 text-xs"
                  >
                    Read More <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
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
