'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Clock,
  Eye,
  Bookmark,
  Share2,
  TrendingUp,
  Flame,
  CheckCircle2,
  ArrowRight,
  Vote,
  Sparkles,
  PlayCircle,
  Volume2,
  Loader2
} from 'lucide-react';
import { CURRENCY_RATES, Article } from '@/data/newsData';
import { getRealArticles } from '@/lib/api';
import DamWeatherWidget from '@/components/DamWeatherWidget';
import { useFont } from '@/components/FontContext';

export default function HomePage() {
  const { toggleBookmark, isBookmarked } = useFont();

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTrendingTag, setActiveTrendingTag] = useState<string | null>(null);
  const [pollVoted, setPollVoted] = useState<number | null>(null);
  const [pollCounts, setPollCounts] = useState([68, 24, 8]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadArticles() {
      try {
        const data = await getRealArticles();
        if (isMounted && data.length > 0) {
          setArticles(data);
        }
      } catch (err) {
        console.error('Failed to load articles from backend database:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadArticles();
    return () => {
      isMounted = false;
    };
  }, []);

  const heroArticle = articles[0] || null;
  const secondaryArticles = articles.slice(1, 5);
  const opinionArticles = [
    {
      id: 'opinion-1',
      title: 'വികസനവും പരിസ്ഥിതിയും: വയനാട് തുരങ്കപാത ഉയർത്തുന്ന ചോദ്യങ്ങൾ',
      author: 'പ്രൊഫ. എം. കെ. സാനു',
      role: 'പ്രമുഖ സാഹിത്യ നിരൂപകൻ & ചിന്തകൻ',
      image:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 'opinion-2',
      title: 'പ്രവാസി നിക്ഷേപങ്ങളും കേരളത്തിന്റെ വ്യവസായ വളർച്ചയും',
      author: 'സി. പി. ജോൺ',
      role: 'സാമ്പത്തിക നിരീക്ഷകൻ',
      image:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    },
  ];

  const handleVote = (idx: number) => {
    if (pollVoted === null) {
      setPollVoted(idx);
      setPollCounts((prev) => {
        const next = [...prev];
        next[idx] += 1;
        return next;
      });
    }
  };

  const handleShare = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard?.writeText(window.location.origin + `/article/${id}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const videoShorts = [
    {
      id: 'v1',
      title: 'വയനാട് തുരങ്കപാത: റൂട്ട് മാപ്പും 3D ആകാശ ദൃശ്യങ്ങളും പുറത്ത്',
      category: 'വികസനം',
      duration: '01:45',
      views: '420K',
      thumbnail: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'v2',
      title: 'മെട്രോ പുതിയ പാത കാക്കനാട്: ട്രയൽ റൺ തത്സമയം കാണാം',
      category: 'മെട്രോ',
      duration: '02:10',
      views: '285K',
      thumbnail: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'v3',
      title: 'സൗദി ഗോൾഡൻ റെസിഡൻസി: പ്രവാസികൾ അറിഞ്ഞിരിക്കേണ്ട 5 മാറ്റങ്ങൾ',
      category: 'പ്രവാസം',
      duration: '03:15',
      views: '510K',
      thumbnail: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'v4',
      title: 'വേനൽമഴ ശക്തമാകുന്നു: തെക്കൻ ജില്ലകളിൽ അതീവ ജാഗ്രതാ നിർദ്ദേശം',
      category: 'കാലാവസ്ഥ',
      duration: '01:20',
      views: '190K',
      thumbnail: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=400&q=80',
    },
  ];

  const topTrendingReads = articles.filter((a) => a.trending).length > 0
    ? articles.filter((a) => a.trending).slice(0, 4)
    : articles.slice(0, 4);

  const totalVotes = pollCounts.reduce((a, b) => a + b, 0);
  const pollPercentages = pollCounts.map((c) => Math.round((c / totalVotes) * 100));

  const trendingTags = [
    '#WayanadTunnel',
    '#KeralaBudget2025',
    '#PravasiHolidays',
    '#KochiMetro',
    '#SantoshTrophy',
    '#SummerRainAlert',
  ];

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Trending Topics & Kerala Desam Focus Strip */}
      <section className="w-full bg-surface-pure border-b border-slate-border py-2.5 px-4 md:px-margin-desktop">
        <div className="max-w-[1360px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-hidden text-xs">
            <span className="font-bold text-ink-midnight flex items-center gap-1.5 shrink-0">
              <span className="w-2 h-2 rounded-full bg-editorial-crimson" />
              കേരളദേശം ഫോക്കസ്:
            </span>
            <p className="text-secondary truncate text-xs font-medium">
              ആഗോള സമകാലികം • ഭാരതം • കേരളത്തിലെ 14 ജില്ലകളിലെ തത്സമയ വാർത്തകൾ
            </p>
          </div>

          {/* Quick Topic Chips */}
          <div className="flex items-center gap-2 overflow-x-auto text-xs no-scrollbar py-0.5 shrink-0 w-full md:w-auto">
            <span className="text-secondary font-bold shrink-0 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-opinion-ochre" />
              ട്രെൻഡിംഗ്:
            </span>
            {trendingTags.map((tag) => (
              <button
                key={tag}
                onClick={() =>
                  setActiveTrendingTag(activeTrendingTag === tag ? null : tag)
                }
                className={`px-2.5 py-0.5 rounded-full transition-colors whitespace-nowrap text-xs font-medium ${
                  activeTrendingTag === tag
                    ? 'bg-primary text-white font-bold shadow-xs'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Editorial Centered Layout */}
      <main className="w-full max-w-[1040px] mx-auto px-4 sm:px-6 md:px-8 py-6">
        <div className="flex flex-col gap-8">
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
          /* Lead Broadsheet Hero Article */
          <article className="bg-surface-pure rounded-lg p-4 sm:p-6 md:p-8 shadow-sm border border-slate-border relative group">
            {/* Category & Badge */}
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="bg-primary text-white px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider shadow-xs">
                പ്രധാന വാർത്ത
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => handleShare(e, heroArticle.id)}
                  className="p-1.5 text-secondary hover:text-primary transition-colors rounded-full hover:bg-surface-container"
                  title="പങ്കുവെക്കുക"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleBookmark(heroArticle.id)}
                  className={`p-1.5 transition-colors rounded-full hover:bg-surface-container ${
                    isBookmarked(heroArticle.id)
                      ? 'text-primary fill-current'
                      : 'text-secondary hover:text-primary'
                  }`}
                  title="ബുക്ക്‌മാർക്ക് ചെയ്യുക"
                >
                  <Bookmark
                    className={`w-4 h-4 ${
                      isBookmarked(heroArticle.id) ? 'fill-primary' : ''
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Dominant Headline */}
            <Link href={`/article/${heroArticle.id}`}>
              <h1 className="font-headline text-xl sm:text-2xl md:text-4xl text-ink-midnight font-bold leading-tight group-hover:text-primary transition-colors mb-4">
                {heroArticle.title}
              </h1>
            </Link>

            {/* Lead Image */}
            <Link href={`/article/${heroArticle.id}`} className="block overflow-hidden rounded-lg relative mb-4 sm:mb-5">
              <img
                src={heroArticle.imageUrl}
                alt={heroArticle.title}
                className="w-full h-56 sm:h-72 md:h-96 object-cover group-hover:scale-[1.02] transition-transform duration-500"
              />
              <span className="absolute bottom-3 left-3 bg-ink-midnight/85 backdrop-blur text-white text-xs px-2.5 py-1 rounded font-medium shadow-md">
                {heroArticle.readTime} • ശബ്ദരൂപം ലഭ്യമാണ്
              </span>
            </Link>

            {/* Lead Paragraph & Highlights Content */}
            <div className="flex flex-col gap-4 mb-6">
              <p className="text-[15px] sm:text-base md:text-lg text-slate-800 leading-[1.8] font-normal">
                {heroArticle.paragraphs[0]}
              </p>

              {heroArticle.paragraphs[1] && (
                <p className="text-xs sm:text-sm text-secondary leading-relaxed">
                  {heroArticle.paragraphs[1]}
                </p>
              )}

              {heroArticle.highlights && (
                <div className="bg-gradient-to-br from-amber-50/80 via-white to-red-50/40 p-4 rounded-xl border border-amber-200/60 shadow-xs">
                  <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-amber-200/50">
                    <h4 className="text-xs sm:text-sm font-bold text-ink-midnight uppercase tracking-wider flex items-center gap-1.5 font-headline">
                      <Sparkles className="w-4 h-4 text-editorial-crimson" />
                      പ്രധാന കണ്ടെത്തലുകൾ:
                    </h4>
                    <span className="text-[10px] font-bold text-editorial-crimson bg-red-100/70 px-2 py-0.5 rounded">
                      KEY POINTS
                    </span>
                  </div>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs sm:text-sm text-slate-800">
                    {heroArticle.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-editorial-crimson mt-2 shrink-0" />
                        <span className="leading-relaxed font-medium">{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Byline & Read More */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-border text-xs sm:text-sm">
              <div className="flex items-center gap-3">
                <img
                  src={heroArticle.author.avatar}
                  alt={heroArticle.author.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-border"
                />
                <div>
                  <span className="font-bold text-ink-midnight block text-xs sm:text-sm">
                    {heroArticle.author.name}
                  </span>
                  <span className="text-[11px] sm:text-xs text-secondary">
                    {heroArticle.author.location} • {heroArticle.timeAgo}
                  </span>
                </div>
              </div>

              <Link
                href={`/article/${heroArticle.id}`}
                className="px-4 py-2 rounded bg-primary text-white font-bold hover:bg-editorial-crimson transition-colors flex items-center gap-1.5 shadow-xs"
              >
                വായിക്കുക <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {copiedId === heroArticle.id && (
              <div className="absolute top-4 right-16 bg-ink-midnight text-white text-xs px-3 py-1.5 rounded shadow-lg animate-in fade-in">
                ലിങ്ക് കോപ്പി ചെയ്തു!
              </div>
            )}
          </article>
          )}

          {/* Secondary 2-Column Story Grid (All 4 Articles) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {secondaryArticles.map((item) => (
              <article
                key={item.id}
                className="bg-surface-pure rounded-lg p-5 shadow-sm border border-slate-border flex flex-col justify-between group hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="overflow-hidden rounded-md mb-3.5 relative">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-44 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span
                      className="absolute top-2 left-2 text-[10px] font-bold uppercase px-2 py-0.5 rounded text-white shadow-xs"
                      style={{ backgroundColor: item.categoryColor || '#C8102E' }}
                    >
                      {item.category}
                    </span>
                  </div>
                  <Link href={`/article/${item.id}`}>
                    <h3 className="font-headline text-base sm:text-lg font-bold text-ink-midnight group-hover:text-primary transition-colors leading-snug mb-2.5">
                      {item.title}
                    </h3>
                  </Link>
                  <p className="text-xs sm:text-sm text-on-surface-variant line-clamp-3 mb-4 leading-relaxed">
                    {item.lead}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-border text-xs text-secondary">
                  <span>{item.timeAgo}</span>
                  <Link
                    href={`/article/${item.id}`}
                    className="text-primary hover:underline font-bold flex items-center gap-1"
                  >
                    വിശദമായി <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* Visual Journalism / Photo Feature Banner */}
          <div className="bg-ink-midnight text-surface-pure rounded-lg p-6 sm:p-8 relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] bg-opinion-ochre text-white px-2.5 py-1 rounded font-bold uppercase tracking-wider">
                ഫോട്ടോ സ്റ്റോറി
              </span>
              <span className="text-xs text-secondary-fixed-dim">
                ദൃശ്യങ്ങളിലൂടെ കേരളം
              </span>
            </div>
            <h3 className="font-headline text-xl sm:text-2xl font-bold mb-2 text-surface-pure">
              കുട്ടനാടൻ കായൽ ജീവിതം: വേനൽമഴയുടെ വരവറിയിച്ച് ഓളങ്ങൾ
            </h3>
            <p className="text-xs sm:text-sm text-secondary-fixed-dim mb-5 leading-relaxed max-w-2xl">
              ആലപ്പുഴയുടെ പച്ചപ്പും കായലോളങ്ങളും പകർത്തുന്ന വിസ്മയകരമായ ക്യാമറ കാഴ്ചകൾ.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="overflow-hidden rounded-md group">
                <img
                  src="https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=400&q=80"
                  alt="Kuttanad 1"
                  className="rounded-md object-cover h-36 w-full group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="overflow-hidden rounded-md group">
                <img
                  src="https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80"
                  alt="Kuttanad 2"
                  className="rounded-md object-cover h-36 w-full group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="overflow-hidden rounded-md group">
                <img
                  src="https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=400&q=80"
                  alt="Kuttanad 3"
                  className="rounded-md object-cover h-36 w-full group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
          </div>

          {/* Video News Shorts & Reels Carousel */}
          <section id="videos" className="bg-surface-pure rounded-lg p-5 sm:p-6 border border-slate-border shadow-xs scroll-mt-24">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-border">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-live-alert animate-ping" />
                <h3 className="font-headline text-lg sm:text-xl font-bold text-ink-midnight flex items-center gap-1.5">
                  <PlayCircle className="w-5 h-5 text-editorial-crimson" />
                  വീഡിയോ വാർത്തകൾ & റീൽസ്
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {videoShorts.map((vid) => (
                <div
                  key={vid.id}
                  className="group relative rounded-lg overflow-hidden bg-black aspect-[9/14] flex flex-col justify-end p-3 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
                >
                  <img
                    src={vid.thumbnail}
                    alt={vid.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 group-hover:opacity-90 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />

                  {/* Play icon overlay */}
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur flex items-center justify-center text-white group-hover:bg-editorial-crimson transition-colors shadow">
                    <PlayCircle className="w-4 h-4 fill-white/20" />
                  </div>

                  {/* Category badge */}
                  <span className="relative z-10 self-start text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-editorial-crimson text-white mb-1.5 shadow-xs">
                    {vid.category}
                  </span>

                  {/* Title */}
                  <h4 className="relative z-10 text-xs sm:text-sm font-bold text-white leading-snug line-clamp-2 mb-2 group-hover:text-amber-300 transition-colors">
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

          {/* 2-Column Opinion Columns & Live Reader Poll */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 cols: Exclusive Opinion & Investigative Columns */}
            <section id="opinion" className="lg:col-span-7 bg-surface-pure rounded-lg p-5 sm:p-6 border border-slate-border shadow-xs flex flex-col justify-between scroll-mt-24">
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-border">
                  <h3 className="font-headline text-lg sm:text-xl font-bold text-ink-midnight flex items-center gap-2">
                    <span className="w-2 h-5 bg-opinion-ochre rounded-xs" />
                    ദേശീയ കോളങ്ങൾ & വിശകലനം
                  </h3>
                  <span className="text-[11px] font-bold text-opinion-ochre uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    EXCLUSIVE
                  </span>
                </div>

                <div className="space-y-4">
                  {opinionArticles.map((op) => (
                    <article
                      key={op.id}
                      className="p-3.5 rounded-lg bg-surface-container-low/60 hover:bg-surface-container-low border border-slate-border transition-colors group"
                    >
                      <div className="flex items-start gap-3.5">
                        <img
                          src={op.image}
                          alt={op.author}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-opinion-ochre/40 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 text-xs text-secondary mb-1">
                            <span className="font-bold text-ink-midnight">
                              {op.author}
                            </span>
                            <span>•</span>
                            <span className="text-[11px] text-secondary truncate">
                              {op.role}
                            </span>
                          </div>
                          <Link href={`/article/wayanad-tunnel`}>
                            <h4 className="font-headline text-sm sm:text-base font-bold text-ink-midnight group-hover:text-primary transition-colors leading-snug">
                              {op.title}
                            </h4>
                          </Link>
                          <span className="inline-flex items-center gap-1 text-[11px] text-opinion-ochre font-bold mt-2">
                            കോളം വായിക്കുക <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              {/* Editorial Note */}
              <div className="mt-4 pt-3 border-t border-slate-border text-xs text-secondary flex items-center justify-between">
                <span>നിഷ്പക്ഷ നിരീക്ഷണം • ആഴ്ചതോറുമുള്ള കോളങ്ങൾ</span>
                <Link href="/about" className="text-primary font-bold hover:underline">
                  ഞങ്ങളുടെ വീക്ഷണം →
                </Link>
              </div>
            </section>

            {/* Right 5 cols: Live Interactive Reader Poll */}
            <section className="lg:col-span-5 bg-surface-pure rounded-lg p-5 sm:p-6 border border-slate-border shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-border">
                  <h3 className="font-headline text-lg sm:text-xl font-bold text-ink-midnight flex items-center gap-2">
                    <Vote className="w-5 h-5 text-editorial-crimson" />
                    ജനഹിതം: ലൈവ് പോൾ
                  </h3>
                  <span className="text-[10px] font-bold bg-editorial-crimson text-white px-2 py-0.5 rounded uppercase">
                    ACTIVE POLL
                  </span>
                </div>

                <p className="font-headline text-sm sm:text-base font-bold text-ink-midnight leading-snug mb-4">
                  വയനാട് തുരങ്കപാത നിർമാണം മലയോര ഗതാഗതത്തിന് പുതിയ കുതിപ്പേകുമോ?
                </p>

                {/* Poll Options */}
                <div className="space-y-2.5">
                  {[
                    { label: 'അതെ, വികസനത്തിന് അനിവാര്യം', pct: pollPercentages[0] },
                    { label: 'ഇല്ല, പരിസ്ഥിതി നാശമുണ്ടാക്കാം', pct: pollPercentages[1] },
                    { label: 'നിഷ്പക്ഷം / അഭിപ്രായമില്ല', pct: pollPercentages[2] },
                  ].map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleVote(idx)}
                      disabled={pollVoted !== null}
                      className={`w-full text-left p-3 rounded-lg border text-xs sm:text-sm font-medium transition-all relative overflow-hidden ${
                        pollVoted === idx
                          ? 'border-editorial-crimson bg-red-50 text-ink-midnight font-bold'
                          : 'border-slate-border bg-surface-container-low hover:bg-surface-container text-on-surface'
                      }`}
                    >
                      {/* Animated Progress Bar when voted */}
                      {pollVoted !== null && (
                        <div
                          className="absolute inset-y-0 left-0 bg-editorial-crimson/15 transition-all duration-700"
                          style={{ width: `${opt.pct}%` }}
                        />
                      )}
                      <div className="relative flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          {pollVoted === idx ? (
                            <CheckCircle2 className="w-4 h-4 text-editorial-crimson shrink-0" />
                          ) : (
                            <span className="w-4 h-4 rounded-full border border-secondary shrink-0" />
                          )}
                          <span>{opt.label}</span>
                        </span>
                        {pollVoted !== null && (
                          <span className="font-bold text-editorial-crimson ml-2">
                            {opt.pct}%
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Poll footer */}
              <div className="mt-4 pt-3 border-t border-slate-border flex items-center justify-between text-xs text-secondary">
                <span>
                  ആകെ വോട്ടുകൾ: <strong className="text-ink-midnight">{totalVotes.toLocaleString()}</strong>
                </span>
                <span className="text-[11px] text-emerald-600 font-bold">
                  {pollVoted !== null ? '✓ വോട്ട് രേഖപ്പെടുത്തി' : 'വോട്ട് രേഖപ്പെടുത്തുക'}
                </span>
              </div>
            </section>
          </div>

          {/* Top Trending Reads + Live Gulf Exchange Bar */}
          <section id="trending" className="bg-surface-pure rounded-lg p-5 sm:p-6 border border-slate-border shadow-xs scroll-mt-24">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-border">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-opinion-ochre" />
                <h3 className="font-headline text-lg sm:text-xl font-bold text-ink-midnight">
                  ഏറ്റവും കൂടുതൽ വായിക്കപ്പെട്ടവ (Top Trending)
                </h3>
              </div>
              <span className="text-xs text-secondary font-medium">
                കഴിഞ്ഞ 24 മണിക്കൂറിലെ ട്രെൻഡുകൾ
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {topTrendingReads.map((item, idx) => (
                <Link
                  key={item.id}
                  href={`/article/${item.id}`}
                  className="p-3.5 rounded-lg bg-surface-container-low/50 hover:bg-surface-container border border-slate-border transition-all flex flex-col justify-between group"
                >
                  <div className="flex items-start gap-3 mb-2">
                    <span className="font-headline text-2xl font-black text-slate-300 group-hover:text-editorial-crimson transition-colors leading-none">
                      0{idx + 1}
                    </span>
                    <h4 className="font-headline text-xs sm:text-sm font-bold text-ink-midnight group-hover:text-primary transition-colors leading-snug line-clamp-3">
                      {item.title}
                    </h4>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-secondary border-t border-slate-border/80 pt-2 mt-2">
                    <span className="font-semibold text-editorial-crimson">
                      {item.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3 text-secondary" /> {item.views}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Gulf Currency Strip */}
            <div className="mt-5 pt-3.5 border-t border-slate-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-slate-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 font-bold text-ink-midnight shrink-0">
                <span className="text-base">💱</span>
                <span>ലൈവ് ഗൾഫ് കറൻസി നിരക്ക് (1 വിദേശ കറൻസി = രൂപയിൽ):</span>
              </div>
              <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-0.5 text-xs">
                {CURRENCY_RATES.slice(0, 4).map((c) => (
                  <span key={c.code} className="inline-flex items-center gap-1 font-semibold text-on-surface whitespace-nowrap">
                    <span>{c.flag} {c.code}:</span>
                    <strong className="text-primary font-bold">₹{c.inrRate.toFixed(2)}</strong>
                  </span>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
