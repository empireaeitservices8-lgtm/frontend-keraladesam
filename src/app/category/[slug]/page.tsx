'use client';

import React, { useState, useMemo } from 'react';
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
  ChevronRight,
  Flame,
  Globe2,
  Building2,
  Film,
  Trophy,
  MessageSquare,
  Loader2
} from 'lucide-react';
import { CATEGORY_CONFIGS, Article } from '@/data/newsData';
import { getRealArticles } from '@/lib/api';
import { useFont } from '@/components/FontContext';
import DamWeatherWidget from '@/components/DamWeatherWidget';

export default function CategoryPage() {
  const params = useParams();
  const slug = (params?.slug as string) || 'politics';
  const { toggleBookmark, isBookmarked } = useFont();

  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

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
    description: 'കേരളത്തിലെയും ആഗോളതലത്തിലെയും സമഗ്ര വാർത്തകളും തത്സമയ വിശകലനങ്ങളും.',
    color: '#006b9a',
    tags: ['പ്രധാന വാർത്തകൾ', 'സമകാലികം', 'തത്സമയം']
  };

  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter articles for this category
  const categoryArticles = useMemo(() => {
    return allArticles.filter((article) => {
      let matchesCategory = false;

      if (slug === 'world') {
        matchesCategory = Boolean(
          article.category.includes('ലോകം') ||
          article.category.includes('ആഗോള') ||
          article.category.includes('പ്രവാസ') ||
          article.category.includes('സൗദി') ||
          article.tags?.some((t) => ['WorldNews', 'GlobalAffairs', 'UNClimate', 'MiddleEast'].includes(t))
        );
      } else if (slug === 'politics') {
        matchesCategory = Boolean(
          article.category.includes('രാഷ്ട്രീയം') ||
          article.category.includes('ഭരണം') ||
          article.category.includes('നിയമസഭ') ||
          article.tags?.some((t) => ['KeralaAssembly', 'Politics', 'Parliament', 'Delimitation', 'StateAssembly'].includes(t))
        );
      } else if (slug === 'business') {
        matchesCategory = Boolean(
          article.category.includes('ബിസിനസ്') ||
          article.category.includes('വികസനം') ||
          article.category.includes('നഗരവികസനം') ||
          article.tags?.some((t) => ['BusinessNews', 'Economy', 'GoldRate', 'VizhinjamPort'].includes(t))
        );
      } else if (slug === 'cinema') {
        matchesCategory = Boolean(
          article.category.includes('സിനിമ') ||
          article.category.includes('കല') ||
          article.category.includes('യാത്ര') ||
          article.tags?.some((t) => ['Mollywood', 'MalayalamCinema', 'Culture', 'UNESCOCityOfLiterature'].includes(t))
        );
      } else if (slug === 'sports') {
        matchesCategory = Boolean(
          article.category.includes('സ്പോർട്സ്') ||
          article.tags?.some((t) => ['Sports', 'Football', 'Cricket', 'IPL2025', 'SantoshTrophy', 'SanjuSamson'].includes(t))
        );
      } else if (slug === 'opinion') {
        matchesCategory = Boolean(
          article.category.includes('അഭിപ്രായം') ||
          article.tags?.some((t) => ['Opinion', 'Education', 'KeralaFuture'].includes(t))
        );
      } else {
        matchesCategory = Boolean(
          article.category.toLowerCase().includes(slug) ||
          article.tags?.some((t) => t.toLowerCase().includes(slug))
        );
      }

      // If no direct matches, return general fallback so page is never empty
      return matchesCategory;
    });
  }, [slug, allArticles]);

  // Fallback if specific category filter yielded too few
  const displayedArticlesList = categoryArticles.length > 0 ? categoryArticles : allArticles.slice(0, 6);

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
        const viewsA = parseFloat(a.views.replace('k', '')) || 0;
        const viewsB = parseFloat(b.views.replace('k', '')) || 0;
        return viewsB - viewsA;
      });
    }

    return list;
  }, [displayedArticlesList, selectedTag, searchFilter, sortBy]);

  const heroArticle = filteredArticles[0] || displayedArticlesList[0];
  const gridArticles = filteredArticles.slice(1);

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
      {/* Category Hero Masthead Banner */}
      <section
        className="w-full text-white py-10 px-4 md:px-margin-desktop border-b shadow-sm relative overflow-hidden"
        style={{ backgroundColor: config.color || '#006b9a' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/25 to-transparent pointer-events-none" />

        <div className="max-w-[1360px] mx-auto relative z-10">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-white/80 mb-3">
            <Link href="/" className="hover:underline">
              ഹോം
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-bold text-white">{config.name}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="p-1.5 rounded-md bg-white/20 backdrop-blur-sm">
                  {getCategoryIcon()}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-white/90">
                  {config.englishTitle}
                </span>
              </div>
              <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-2">
                {config.name}
              </h1>
              <p className="text-xs sm:text-sm text-white/85 max-w-2xl leading-relaxed">
                {config.description}
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-2 self-start md:self-auto bg-black/30 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>
                ലഭ്യമായ വാർത്തകൾ: <strong>{filteredArticles.length}</strong>
              </span>
            </div>
          </div>

          {/* Sub-tags Pill Bar */}
          <div className="mt-6 pt-4 border-t border-white/20 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                selectedTag === null
                  ? 'bg-white text-ink-midnight shadow-sm'
                  : 'bg-white/15 hover:bg-white/25 text-white'
              }`}
            >
              എല്ലാം (All)
            </button>
            {config.tags.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTag(selectedTag === t ? null : t)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedTag === t
                    ? 'bg-white text-ink-midnight font-bold shadow-sm'
                    : 'bg-white/15 hover:bg-white/25 text-white'
                }`}
              >
                #{t}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-[1360px] mx-auto px-4 md:px-margin-desktop py-8 w-full">
        {/* Controls Bar: Search & Sort */}
        <div className="bg-surface-pure rounded-lg p-3 sm:p-4 border border-slate-border shadow-xs mb-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-secondary" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder={`${config.name} വാർത്തകളിൽ തിരയുക...`}
              className="w-full bg-surface-container-low pl-9 pr-3 py-1.5 text-xs rounded-md border border-slate-border focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 text-xs">
            <span className="text-secondary font-medium">ക്രമീകരിക്കുക:</span>
            <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-md border border-slate-border">
              <button
                onClick={() => setSortBy('latest')}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  sortBy === 'latest'
                    ? 'bg-surface-pure shadow-xs text-ink-midnight font-bold'
                    : 'text-secondary hover:text-on-surface'
                }`}
              >
                ഏറ്റവും പുതിയത്
              </button>
              <button
                onClick={() => setSortBy('popular')}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  sortBy === 'popular'
                    ? 'bg-surface-pure shadow-xs text-ink-midnight font-bold'
                    : 'text-secondary hover:text-on-surface'
                }`}
              >
                ജനപ്രിയം
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
                className="lg:col-span-7 overflow-hidden rounded-lg relative block"
              >
                <img
                  src={heroArticle.imageUrl}
                  alt={heroArticle.title}
                  className="w-full h-64 sm:h-80 md:h-96 object-cover group-hover:scale-[1.02] transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-editorial-crimson text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded shadow-xs">
                  {heroArticle.category}
                </span>
                <span className="absolute bottom-3 left-3 bg-black/75 backdrop-blur text-white text-xs px-2.5 py-1 rounded">
                  {heroArticle.readTime}
                </span>
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
                      വായിക്കുക <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </article>
        )}

        {/* Secondary Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gridArticles.map((article) => (
            <article
              key={article.id}
              className="bg-surface-pure rounded-xl p-4 sm:p-5 border border-slate-border shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <Link
                  href={`/article/${article.id}`}
                  className="block overflow-hidden rounded-lg mb-3.5 relative"
                >
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span
                    className="absolute top-2 left-2 text-[10px] font-bold uppercase px-2 py-0.5 rounded text-white shadow-xs"
                    style={{ backgroundColor: article.categoryColor || config.color }}
                  >
                    {article.category}
                  </span>
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
                    വിശദമായി <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Empty State */}
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
