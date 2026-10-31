'use client';

import React, { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Clock,
  Eye,
  Bookmark,
  Share2,
  ArrowRight,
  TrendingUp,
  Filter,
  Search,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Flame,
  Globe2,
  Building2,
  Film,
  Trophy,
  MessageSquare,
  Loader2,
  Newspaper,
  Check,
} from 'lucide-react';
import { CATEGORY_CONFIGS, Article } from '@/data/newsData';
import { getRealArticles, deduplicateArticles } from '@/lib/api';
import { useFont } from '@/components/FontContext';

export default function CategoryPage() {
  const params = useParams();
  const slug = (params?.slug as string) || 'politics';
  const { toggleBookmark, isBookmarked } = useFont();

  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const ITEMS_PER_PAGE = 9;
  const [currentPage, setCurrentPage] = useState(1);

  // Slider refs and helper
  const tagsRef = useRef<HTMLDivElement>(null);
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

  React.useEffect(() => {
    let isMounted = true;
    async function loadCategoryData() {
      try {
        setLoading(true);
        const data = await getRealArticles();
        if (isMounted) {
          setAllArticles(data);
        }
      } catch (e) {
        console.error('Error fetching category articles from backend:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadCategoryData();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  const config = CATEGORY_CONFIGS[slug] || {
    slug,
    name: slug.charAt(0).toUpperCase() + slug.slice(1),
    englishTitle: `${slug.toUpperCase()} NEWS`,
    description: 'Comprehensive coverage, in-depth reports, and live analysis from Kerala Desam.',
    color: '#006b9a',
    tags: ['TOP STORIES', 'LATEST', 'SPECIAL']
  };

  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter articles strictly for this category
  const categoryArticles = useMemo(() => {
    return allArticles.filter((article) => {
      const artCat = (article.category || '').toLowerCase();
      const tags = article.tags || [];

      if (slug === 'world') {
        return Boolean(
          artCat.includes('ലോകം') ||
          artCat.includes('ആഗോള') ||
          artCat.includes('അന്താരാഷ്ട്ര') ||
          artCat.includes('അന്തർദേശീയ') ||
          artCat.includes('world') ||
          artCat.includes('international') ||
          (article.district && (article.district.includes('അന്തർദേശീയം') || article.district.includes('അന്താരാഷ്ട്രം'))) ||
          tags.some((t) => ['WorldNews', 'GlobalAffairs', 'UNClimate', 'MiddleEast', 'World', 'International'].some(kw => t.toLowerCase().includes(kw.toLowerCase())))
        );
      } else if (slug === 'politics') {
        return Boolean(
          artCat.includes('രാഷ്ട്രീയം') ||
          artCat.includes('ഭരണം') ||
          artCat.includes('നിയമസഭ') ||
          artCat.includes('politics') ||
          tags.some((t) => ['KeralaAssembly', 'Politics', 'Parliament', 'Delimitation', 'StateAssembly'].some(kw => t.toLowerCase().includes(kw.toLowerCase())))
        );
      } else if (slug === 'business') {
        return Boolean(
          artCat.includes('ബിസിനസ്') ||
          artCat.includes('സമ്പദ്') ||
          artCat.includes('വിപണി') ||
          artCat.includes('business') ||
          tags.some((t) => ['BusinessNews', 'Economy', 'GoldRate', 'VizhinjamPort'].some(kw => t.toLowerCase().includes(kw.toLowerCase())))
        );
      } else if (slug === 'cinema') {
        return Boolean(
          artCat.includes('സിനിമ') ||
          artCat.includes('കല') ||
          artCat.includes('ചലച്ചിത്ര') ||
          artCat.includes('cinema') ||
          tags.some((t) => ['Mollywood', 'MalayalamCinema', 'Culture', 'Film', 'Cinema'].some(kw => t.toLowerCase().includes(kw.toLowerCase())))
        );
      } else if (slug === 'sports') {
        return Boolean(
          artCat.includes('സ്പോർട്സ്') ||
          artCat.includes('കായികം') ||
          artCat.includes('sports') ||
          tags.some((t) => ['Sports', 'Football', 'Cricket', 'IPL2025', 'SantoshTrophy', 'SanjuSamson'].some(kw => t.toLowerCase().includes(kw.toLowerCase())))
        );
      } else if (slug === 'opinion') {
        return Boolean(
          artCat.includes('അഭിപ്രായം') ||
          artCat.includes('എഡിറ്റോറിയൽ') ||
          artCat.includes('വിശകലനം') ||
          artCat.includes('opinion') ||
          tags.some((t) => ['Opinion', 'Education', 'KeralaFuture', 'Editorial'].some(kw => t.toLowerCase().includes(kw.toLowerCase())))
        );
      } else if (slug === 'special') {
        return Boolean(
          artCat.includes('പ്രത്യേക') ||
          artCat.includes('അന്വേഷണ') ||
          artCat.includes('special') ||
          tags.some((t) => ['SpecialReport', 'Investigation', 'Special'].some(kw => t.toLowerCase().includes(kw.toLowerCase())))
        );
      } else {
        return Boolean(
          artCat.includes(slug.toLowerCase()) ||
          tags.some((t) => t.toLowerCase().includes(slug.toLowerCase()))
        );
      }
    });
  }, [slug, allArticles]);

  // Strictly only show articles belonging to this category - zero fallback bleed
  const displayedArticlesList = categoryArticles;

  // Apply tag and search filtering
  const filteredArticles = useMemo(() => {
    let list = [...displayedArticlesList];

    if (selectedTag) {
      list = list.filter(
        (a) =>
          a.tags?.some((t) => t.toLowerCase().includes(selectedTag.toLowerCase())) ||
          a.title.includes(selectedTag) ||
          a.lead.includes(selectedTag)
      );
    }

    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.lead.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'popular') {
      list.sort((a, b) => {
        const viewsA = parseFloat(a.views.replace(/[^0-9.]/g, '')) || 0;
        const viewsB = parseFloat(b.views.replace(/[^0-9.]/g, '')) || 0;
        return viewsB - viewsA;
      });
    }

    return deduplicateArticles(list);
  }, [displayedArticlesList, selectedTag, searchFilter, sortBy]);

  const heroArticle = filteredArticles.length > 0 ? filteredArticles[0] : null;
  const gridArticles = useMemo(() => {
    if (!heroArticle) return filteredArticles.slice(1);
    const heroTitleNorm = (heroArticle.title || '').trim().toLowerCase();
    const heroId = heroArticle.id || heroArticle._id;
    return filteredArticles.filter((a) => {
      if (heroId && (a.id === heroId || a._id === heroId)) return false;
      if (heroTitleNorm && (a.title || '').trim().toLowerCase() === heroTitleNorm) return false;
      return true;
    });
  }, [filteredArticles, heroArticle]);

  const totalPages = Math.max(1, Math.ceil(gridArticles.length / ITEMS_PER_PAGE));
  const paginatedGridArticles = gridArticles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      const gridEl = document.getElementById('category-grid-top');
      if (gridEl) {
        gridEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleShare = (e: React.MouseEvent, articleId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/article/${articleId}`;
      navigator.clipboard.writeText(url);
      setCopiedId(articleId);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const getCategoryIcon = () => {
    switch (slug) {
      case 'world':
        return <Globe2 className="w-5 h-5 text-white" />;
      case 'politics':
        return <Building2 className="w-5 h-5 text-white" />;
      case 'cinema':
        return <Film className="w-5 h-5 text-white" />;
      case 'sports':
        return <Trophy className="w-5 h-5 text-white" />;
      case 'opinion':
        return <MessageSquare className="w-5 h-5 text-white" />;
      default:
        return <TrendingUp className="w-5 h-5 text-white" />;
    }
  };

  return (
    <div className="flex flex-col w-full pb-16 bg-[#fbfbfb]">
      {/* Category Hero Masthead Banner - Clean White Background with Category Accent */}
      <section className="w-full bg-surface-pure border-b border-slate-border py-6 sm:py-8 px-4 md:px-margin-desktop shadow-xs">
        <div className="max-w-[1360px] mx-auto">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-secondary mb-3 uppercase tracking-wider font-semibold">
            <Link href="/" className="hover:text-primary transition-colors font-bold text-sm sm:text-base">
              HOME
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/" className="hover:text-primary transition-colors">
              CATEGORIES
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-bold" style={{ color: config.color || '#C8102E' }}>
              {config.name}
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="p-1.5 rounded-md text-white shadow-xs flex items-center justify-center"
                  style={{ backgroundColor: config.color || '#C8102E' }}
                >
                  {getCategoryIcon()}
                </span>
                
              </div>
              <h1 className="font-headline text-2xl sm:text-3xl md:text-4xl text-ink-midnight font-bold tracking-tight mb-2 uppercase">
                {config.englishTitle}
              </h1>
              <p className="text-xs sm:text-sm text-secondary max-w-2xl leading-relaxed">
                {config.description}
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-2 self-start md:self-auto bg-surface-container-low px-3.5 py-1.5 rounded-full border border-slate-200 text-xs text-secondary font-medium shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>
                Stories: <strong className="text-ink-midnight">{filteredArticles.length}</strong>
              </span>
            </div>
          </div>

          {/* Sub-tags Pill Bar with Interactive Slider Controls */}
          <div className="mt-5 pt-3.5 border-t border-slate-200 flex items-center gap-2 relative">
            <button
              onClick={() => slideLeft(tagsRef)}
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-editorial-crimson hover:text-white border border-slate-200 flex items-center justify-center transition-colors text-slate-700 shadow-xs shrink-0"
              title="ഇടത്തേക്ക് നീക്കുക"
              aria-label="Scroll Left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div
              ref={tagsRef}
              className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth flex-1 py-1"
            >
              <button
                onClick={() => {
                  setSelectedTag(null);
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                  selectedTag === null
                    ? 'text-white font-bold shadow-xs scale-105'
                    : 'bg-surface-container-low hover:bg-surface-container-high text-on-surface border border-slate-200/80'
                }`}
                style={selectedTag === null ? { backgroundColor: config.color || '#C8102E' } : undefined}
              >
                ALL
              </button>
              {config.tags.map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setSelectedTag(selectedTag === t ? null : t);
                    setCurrentPage(1);
                  }}
                  className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                    selectedTag === t
                      ? 'text-white font-bold shadow-xs scale-105'
                      : 'bg-surface-container-low hover:bg-surface-container-high text-on-surface border border-slate-200/80'
                  }`}
                  style={selectedTag === t ? { backgroundColor: config.color || '#C8102E' } : undefined}
                >
                  {t}
                </button>
              ))}
            </div>

            <button
              onClick={() => slideRight(tagsRef)}
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-editorial-crimson hover:text-white border border-slate-200 flex items-center justify-center transition-colors text-slate-700 shadow-xs shrink-0"
              title="വലത്തേക്ക് നീക്കുക"
              aria-label="Scroll Right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-[1360px] mx-auto px-4 md:px-margin-desktop py-8 w-full">
        {displayedArticlesList.length === 0 ? (
          /* Dedicated Category Empty State */
          <div className="bg-surface-pure rounded-xl p-10 sm:p-16 text-center border border-slate-border my-6 shadow-xs max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <Newspaper className="w-8 h-8 text-secondary" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-ink-midnight mb-2 font-headline uppercase">
              NO {config.englishTitle} AVAILABLE
            </h2>
            <p className="text-sm text-secondary max-w-md mx-auto mb-6 leading-relaxed">
              ഈ വിഭാഗത്തിൽ പുതിയ വാർത്തകൾ ഇപ്പോൾ ലഭ്യമായിട്ടില്ല. ന്യൂസ് ഡെസ്കിൽ നിന്ന് വാർത്തകൾ ഉടൻ അപ്‌ഡേറ്റ് ചെയ്യുന്നതാണ്.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/"
                className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded shadow-xs hover:bg-editorial-crimson transition-colors uppercase tracking-wider"
              >
                Return to Top Stories
              </Link>
              <Link
                href="/kerala"
                className="px-5 py-2.5 bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold rounded transition-colors uppercase tracking-wider"
              >
                View Kerala News
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Controls Bar: Search & Sort */}
            <div className="bg-surface-pure rounded-lg p-3 sm:p-4 border border-slate-border shadow-xs mb-8 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-secondary" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder={`Search in ${config.name} stories...`}
                  className="w-full bg-surface-container-low pl-9 pr-3 py-1.5 text-xs rounded-md border border-slate-border focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 text-xs">
            <span className="text-secondary font-medium uppercase tracking-wider text-[11px]">SORT BY:</span>
            <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-md border border-slate-border">
              <button
                onClick={() => setSortBy('latest')}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  sortBy === 'latest'
                    ? 'bg-surface-pure shadow-xs text-ink-midnight font-bold'
                    : 'text-secondary hover:text-on-surface'
                }`}
              >
                LATEST
              </button>
              <button
                onClick={() => setSortBy('popular')}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  sortBy === 'popular'
                    ? 'bg-surface-pure shadow-xs text-ink-midnight font-bold'
                    : 'text-secondary hover:text-on-surface'
                }`}
              >
                POPULAR
              </button>
            </div>
          </div>
        </div>

        {/* Lead Article (If available) */}
        {heroArticle && (
          <article className="bg-surface-pure rounded-xl p-5 sm:p-7 shadow-sm border border-slate-border mb-8 group transition-all hover:shadow-md">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <Link
                href={`/article/${heroArticle.id}`}
                className="lg:col-span-7 overflow-hidden rounded-lg block"
              >
                {heroArticle.imageUrl ? (
                  <img
                    src={heroArticle.imageUrl}
                    alt={heroArticle.title}
                    className="w-full h-64 sm:h-80 md:h-96 object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-64 sm:h-80 md:h-96 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-6 border border-slate-border">
                    <span className="text-sm font-serif font-bold text-slate-400">
                      കേരളദേശം • {heroArticle.category}
                    </span>
                  </div>
                )}
              </Link>

              <div className="lg:col-span-5 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between text-xs text-secondary mb-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {heroArticle.timeAgo}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-emerald-600">
                      <Eye className="w-3.5 h-3.5" /> {heroArticle.views} വായനക്കാർ
                    </span>
                  </div>

                  <Link href={`/article/${heroArticle.id}`}>
                    <h2 className="font-headline text-xl sm:text-2xl md:text-3xl font-bold text-ink-midnight group-hover:text-primary transition-colors leading-tight mb-3">
                      {heroArticle.title}
                    </h2>
                  </Link>

                  <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed line-clamp-4 mb-4">
                    {heroArticle.lead}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-border flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={heroArticle.author.avatar}
                      alt={heroArticle.author.name}
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-border"
                    />
                    <div>
                      <span className="text-xs font-bold text-ink-midnight block">
                        {heroArticle.author.name}
                      </span>
                      <span className="text-[10px] text-secondary">
                        {heroArticle.author.location}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleShare(e, heroArticle.id)}
                      className="p-2 text-secondary hover:text-primary rounded-full hover:bg-surface-container transition-colors"
                      title="പങ്കുവെക്കുക"
                    >
                      <Share2 className="w-4 h-4" />
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

        {/* Secondary Articles Grid with Pagination */}
        {gridArticles.length > 0 && (
          <div id="category-grid-top" className="scroll-mt-24 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-200">
              <h3 className="text-base sm:text-lg font-bold text-ink-midnight font-headline uppercase tracking-wide flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: config.color || '#C8102E' }}
                />
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
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center p-2">
                          <span className="text-[10px] sm:text-xs font-serif font-bold text-slate-400">
                            കേരളദേശം വാർത്ത
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
                        className={`p-1 rounded-full hover:bg-slate-100 transition-colors ${
                          isBookmarked(article.id)
                            ? 'text-primary fill-current'
                            : 'text-secondary hover:text-primary'
                        }`}
                        title="ബുക്ക്‌മാർക്ക്"
                        aria-label="Bookmark article"
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
                        <span className="hidden sm:inline">വിശദമായി</span> <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <nav aria-label="Category news pagination" className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
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
                          style={currentPage === pageNum ? { backgroundColor: config.color || '#C8102E' } : undefined}
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

            {/* Filter Search Empty State */}
            {filteredArticles.length === 0 && (
              <div className="bg-surface-pure rounded-xl p-12 text-center border border-slate-border my-6">
                <Search className="w-10 h-10 text-secondary mx-auto mb-3" />
                <h3 className="text-base font-bold text-ink-midnight mb-1">
                  വാർത്തകളൊന്നും കണ്ടെത്താനായില്ല
                </h3>
                <p className="text-xs text-secondary max-w-md mx-auto mb-4">
                  തിരഞ്ഞെടുത്ത ഫിൽട്ടറുകൾ അല്ലെങ്കിൽ തിരച്ചിൽ പദങ്ങൾക്ക് അനുയോജ്യമായ വാർത്തകൾ ഇപ്പോൾ ലഭ്യമല്ല.
                </p>
                <button
                  onClick={() => {
                    setSearchFilter('');
                    setSelectedTag(null);
                  }}
                  className="px-4 py-2 bg-primary text-white text-xs font-bold rounded shadow-xs hover:bg-editorial-crimson transition-colors"
                >
                  ഫിൽട്ടറുകൾ ഒഴിവാക്കുക
                </button>
              </div>
            )}
          </>
        )}

        {/* Toast for Copied Link */}
        {copiedId && (
          <div className="fixed bottom-6 right-6 bg-ink-midnight text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xl z-50 animate-in fade-in flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> ലിങ്ക് കോപ്പി ചെയ്തു!
          </div>
        )}
      </main>
    </div>
  );
}
