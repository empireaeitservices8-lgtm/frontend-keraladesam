'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Clock,
  MapPin,
  CheckCircle2,
  Share2,
  Bookmark,
  MessageSquare,
  ThumbsUp,
  Heart,
  Send,
  ArrowLeft,
  ArrowRight,
  Eye,
  Check,
  Plus,
  Bell,
  Sparkles,
  Loader2
} from 'lucide-react';
import { Article } from '@/data/newsData';
import { getRealArticleById, getRealArticles, likeArticle } from '@/lib/api';
import { useFont } from '@/components/FontContext';

export default function ArticleDetailPage() {
  const params = useParams();
  const articleId = (params?.id as string) || '';
  const { toggleBookmark, isBookmarked } = useFont();

  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  // Likes & Follow state
  const [likesCount, setLikesCount] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [isFollowingAuthor, setIsFollowingAuthor] = useState<boolean>(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [articleId]);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      if (!articleId) return;
      try {
        setLoading(true);
        const data = await getRealArticleById(articleId);
        if (isMounted && data) {
          setArticle(data);
          setLikesCount(data.likesCount ?? data.likes ?? 0);
          // Load related without any duplicates or current article repeating
          const rel = await getRealArticles({ limit: 15 });
          if (isMounted) {
            const currentTitleNorm = (data.title || '')
              .trim()
              .toLowerCase()
              .replace(/[\s\u200B-\u200D\uFEFF]+/g, ' ')
              .replace(/[.;:!?।"'`’‘“”]+$/, '');

            const currentIds = new Set<string>();
            if (data.id) currentIds.add(String(data.id));
            if (data._id) currentIds.add(String(data._id));
            if (data.customId) currentIds.add(String(data.customId));

            const seenTitles = new Set<string>();
            if (currentTitleNorm) seenTitles.add(currentTitleNorm);

            const uniqueRel: Article[] = [];
            for (const r of rel) {
              const rId = String(r.id || r._id || r.customId || '').trim();
              const rTitleNorm = (r.title || '')
                .trim()
                .toLowerCase()
                .replace(/[\s\u200B-\u200D\uFEFF]+/g, ' ')
                .replace(/[.;:!?।"'`’‘“”]+$/, '');

              if (rId && currentIds.has(rId)) continue;
              if (rTitleNorm && seenTitles.has(rTitleNorm)) continue;

              if (rId) currentIds.add(rId);
              if (rTitleNorm) seenTitles.add(rTitleNorm);
              uniqueRel.push(r);
              if (uniqueRel.length >= 6) break;
            }
            setRelatedArticles(uniqueRel);
          }
        }
      } catch (err) {
        console.error('Error fetching article from backend database:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [articleId]);

  useEffect(() => {
    if (!articleId || typeof window === 'undefined') return;
    try {
      const liked = localStorage.getItem(`kd_liked_${articleId}`);
      setIsLiked(liked === 'true');
      const followed = localStorage.getItem(`kd_followed_${articleId}`);
      setIsFollowing(followed === 'true');
      if (article?.author?.name) {
        const followedAuthor = localStorage.getItem(`kd_followed_author_${article.author.name}`);
        setIsFollowingAuthor(followedAuthor === 'true');
      }
    } catch {}
  }, [articleId, article?.author?.name]);

  const handleLikeToggle = async () => {
    if (!articleId) return;
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    const newCount = nextLiked ? likesCount + 1 : Math.max(0, likesCount - 1);
    setLikesCount(newCount);

    try {
      if (nextLiked) {
        localStorage.setItem(`kd_liked_${articleId}`, 'true');
        showToast('വാർത്ത ലൈക്ക് ചെയ്തു! ❤️');
      } else {
        localStorage.removeItem(`kd_liked_${articleId}`);
        showToast('ലൈക്ക് പിൻവലിച്ചു');
      }
      const res = await likeArticle(articleId, nextLiked ? 'like' : 'unlike');
      if (res && typeof res.likesCount === 'number') {
        setLikesCount(res.likesCount);
      }
    } catch (err) {
      console.error('Like toggle failed:', err);
    }
  };

  const handleFollowToggle = () => {
    if (!articleId) return;
    const nextFollow = !isFollowing;
    setIsFollowing(nextFollow);
    try {
      if (nextFollow) {
        localStorage.setItem(`kd_followed_${articleId}`, 'true');
        if (!isBookmarked(articleId)) {
          toggleBookmark(articleId);
        }
        showToast('വാർത്ത ഫോളോ ചെയ്തു! സേവ് ചെയ്ത വാർത്തകളിലും അപ്‌ഡേറ്റുകളിലും ലഭ്യമാകും. 🔔');
      } else {
        localStorage.removeItem(`kd_followed_${articleId}`);
        showToast('ഫോളോ ചെയ്യുന്നത് നിർത്തി');
      }
    } catch {}
  };

  const handleFollowAuthorToggle = () => {
    if (!article?.author?.name) return;
    const authorKey = article.author.name;
    const nextFollow = !isFollowingAuthor;
    setIsFollowingAuthor(nextFollow);
    try {
      if (nextFollow) {
        localStorage.setItem(`kd_followed_author_${authorKey}`, 'true');
        showToast(`${authorKey} യുടെ വാർത്തകൾ ഫോളോ ചെയ്തു! ✓`);
      } else {
        localStorage.removeItem(`kd_followed_author_${authorKey}`);
        showToast(`${authorKey} ഫോളോ ചെയ്യുന്നത് നിർത്തി`);
      }
    } catch {}
  };

  const [copiedLink, setCopiedLink] = useState(false);

  interface CommentItem {
    id: string;
    author: string;
    text: string;
    time: string;
    likes: number;
  }

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentAuthor, setCommentAuthor] = useState('');
  const [newComment, setNewComment] = useState('');

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const item: CommentItem = {
      id: Date.now().toString(),
      author: commentAuthor.trim() || 'വായനക്കാരൻ',
      text: newComment.trim(),
      time: 'ഇപ്പോൾ',
      likes: 0,
    };
    setComments([item, ...comments]);
    setNewComment('');
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleShareWhatsApp = () => {
    if (!article) return;
    const text = encodeURIComponent(`${article.title}\n${window.location.href}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm font-semibold text-slate-700">വാർത്ത ഡാറ്റാബേസിൽ നിന്ന് ലഭ്യമാക്കുന്നു...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <h2 className="text-xl font-bold text-ink-midnight font-headline">വാർത്ത കണ്ടെത്താനായില്ല</h2>
        <p className="text-xs text-secondary max-w-md">ഈ വാർത്ത ഡാറ്റാബേസിൽ ലഭ്യമല്ല അല്ലെങ്കിൽ നീക്കം ചെയ്യപ്പെട്ടിരിക്കാം.</p>
        <Link href="/" className="px-4 py-2 bg-primary text-white rounded text-xs font-bold hover:bg-editorial-crimson">
          പ്രധാന പേജിലേക്ക് മടങ്ങുക
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full pb-16">
      <div className="max-w-[1360px] mx-auto px-4 md:px-margin-desktop w-full">
        {/* Editorial Breadcrumb & Category Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-5 pb-3 border-b border-slate-200">
          <nav aria-label="Breadcrumbs" className="flex items-center gap-2.5 text-sm sm:text-base font-bold">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-ink-midnight hover:text-primary font-black uppercase tracking-wider text-sm sm:text-base transition-colors shadow-2xs group"
              title="ഹോം പേജിലേക്ക് മടങ്ങുക"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-editorial-crimson group-hover:-translate-x-1 transition-transform" />
              <span className="font-headline font-extrabold text-sm sm:text-base">HOME</span>
            </Link>
            <span className="text-slate-300 font-bold">/</span>
            <Link href="/kerala" className="text-editorial-crimson font-bold hover:underline text-xs sm:text-sm uppercase">
              {article.district || 'KERALA'}
            </Link>
            <span className="text-slate-300 font-bold">/</span>
            <span className="text-slate-800 font-semibold text-xs sm:text-sm">{article.category}</span>
          </nav>

          <div className="flex items-center gap-2.5 sm:gap-4 flex-wrap">
            {/* Catchy, Prominent Total Reads Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/70 border border-emerald-300/80 px-3.5 py-1.5 rounded-full shadow-xs">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
              </span>
              <Eye className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className="text-xs sm:text-sm text-slate-700 flex items-center gap-1 font-bold">
                <strong className="text-base sm:text-lg font-black text-emerald-800 tracking-tight">
                  {article.views || '1'}
                </strong>
                <span className="text-emerald-950 font-bold text-xs sm:text-sm">വായനക്കാർ</span>
              </span>
            </div>

            <span className="hidden md:inline text-slate-300">|</span>

            <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {article.publishedAt}
            </span>
            {article.updatedAt && (
              <>
                <span className="hidden md:inline text-slate-300">|</span>
                <span className="hidden md:flex items-center gap-1 text-editorial-crimson font-semibold text-xs">
                  Updated: {article.updatedAt}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Article Header & Lead Area */}
        <header className="pt-4 sm:pt-6 pb-4">
          <h1 className="font-headline text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-ink-midnight font-bold tracking-tight mb-2.5 sm:mb-3 leading-[1.25]">
            {article.title}
          </h1>

          {/* Render lead only if distinct from paragraph 0, avoiding redundant repetition */}
          {article.lead &&
            (!article.paragraphs?.[0] ||
              (article.lead.trim() !== article.paragraphs[0].trim() &&
                !article.paragraphs[0].trim().startsWith(article.lead.trim().slice(0, 50)) &&
                !article.lead.trim().startsWith(article.paragraphs[0].trim().slice(0, 50)))) && (
              <p className="text-sm sm:text-base md:text-xl text-on-surface-variant leading-relaxed max-w-4xl mb-4 sm:mb-6 font-normal">
                {article.lead}
              </p>
            )}

          {/* Byline & Interactive Audio Toolbar Strip */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 py-3 border-y border-slate-border bg-surface-pure/80 px-4 rounded-sm">
            {/* Author Byline */}
            <div className="flex items-center gap-3">
              <img
                src={
                  article.author.avatar && !article.author.avatar.includes('534528741775')
                    ? article.author.avatar
                    : 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=400&q=80'
                }
                alt={article.author.name}
                onError={(e) => {
                  e.currentTarget.src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23C8102E' rx='50'/%3E%3Ctext x='50' y='58' font-size='34' font-family='sans-serif' font-weight='bold' fill='white' text-anchor='middle'%3EKD%3C/text%3E%3C/svg%3E";
                }}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-border shadow-xs"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-headline text-base font-bold text-ink-midnight leading-none">
                    {(article.author.name?.toLowerCase().includes('editor') || article.author.name?.toLowerCase().includes('chief'))
                      ? 'എഡിറ്റർ'
                      : article.author.name || 'കേരളദേശം ന്യൂസ് ഡെസ്ക്'}
                  </span>
                  {article.author.verified && (
                    <span title="വെരിഫൈഡ് ലേഖകൻ">
                      <CheckCircle2
                        className="w-4 h-4 text-primary fill-primary/10"
                      />
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-secondary mt-1">
                  <span>{article.author.designation || 'ഡെസ്ക് റിപ്പോർട്ടർ'}</span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5">
                    <MapPin className="w-3 h-3" /> {article.author.location || 'കേരളം'}
                  </span>
                </div>
              </div>
            </div>

            {/* Article Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {/* News Like Button */}
              <button
                onClick={handleLikeToggle}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs active:scale-95 ${
                  isLiked
                    ? 'bg-rose-50 text-rose-600 border border-rose-300 ring-2 ring-rose-200'
                    : 'bg-surface-container hover:bg-surface-container-high text-slate-700 hover:text-rose-600 border border-slate-200'
                }`}
                title={isLiked ? 'ലൈക്ക് പിൻവലിക്കുക' : 'വാർത്ത ലൈക്ക് ചെയ്യുക'}
              >
                <Heart
                  className={`w-4 h-4 transition-transform ${
                    isLiked ? 'fill-rose-500 text-rose-500 scale-110' : 'text-slate-600'
                  }`}
                />
                <span>{likesCount > 0 ? `${likesCount} ലൈക്ക്` : 'ലൈക്ക്'}</span>
              </button>

              {/* Follow News Button */}
              <button
                onClick={handleFollowToggle}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs active:scale-95 ${
                  isFollowing
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-ink-midnight hover:bg-primary text-white'
                }`}
                title={isFollowing ? 'ഫോളോ ചെയ്യുന്നത് നിർത്തുക' : 'ഈ വാർത്തയും അപ്‌ഡേറ്റുകളും ഫോളോ ചെയ്യുക'}
              >
                {isFollowing ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 text-white" />
                    <span>Follow News</span>
                  </>
                )}
              </button>

              <button
                onClick={handleShareWhatsApp}
                className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                title="വാട്സാപ്പിൽ പങ്കുവെക്കുക"
              >
                വാട്സാപ്പ്
              </button>

              <button
                onClick={handleCopyLink}
                className="p-2 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold flex items-center gap-1 transition-colors border border-slate-200"
                title="ലിങ്ക് കോപ്പി ചെയ്യുക"
              >
                {copiedLink ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
              </button>

              <button
                onClick={() => toggleBookmark(article.id)}
                className={`p-2 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors border border-slate-200 ${
                  isBookmarked(article.id)
                    ? 'text-primary'
                    : 'text-on-surface'
                }`}
                title="ബുക്ക്‌മാർക്ക് ചെയ്യുക"
              >
                <Bookmark
                  className={`w-4 h-4 ${
                    isBookmarked(article.id) ? 'fill-primary' : ''
                  }`}
                />
              </button>
            </div>
            </div>
        </header>

        {/* 2-Column Article Reader Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
          {/* Main Article Body (8 cols) */}
          <main className="lg:col-span-8 space-y-6">
            {/* Featured Image - renders only when image exists */}
            {article.imageUrl ? (
              <figure className="overflow-hidden rounded-md border border-slate-border">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-80 md:h-[460px] object-cover"
                />
                {article.imageCaption && (
                  <figcaption className="p-2.5 bg-surface-pure text-xs text-secondary border-t border-slate-border">
                    {article.imageCaption}
                  </figcaption>
                )}
              </figure>
            ) : null}

            {/* Highlights Box */}
            {Array.isArray(article.highlights) && article.highlights.length > 0 && (
              <div className="bg-surface-container-low p-5 rounded-md border-l-4 border-l-primary border border-slate-border">
                <h3 className="font-headline text-base font-bold text-ink-midnight mb-3">
                  പ്രധാന വശങ്ങൾ:
                </h3>
                <ul className="space-y-2 text-sm text-on-surface">
                  {article.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary font-bold text-lg leading-none">•</span>
                      <span className="leading-relaxed">{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Rich Article Paragraphs with Broadsheet formatting */}
            <div className="space-y-5 text-base md:text-lg leading-relaxed text-on-surface">
              {article.paragraphs.map((p, index) => (
                <p
                  key={index}
                  className={index === 0 ? 'newspaper-lead' : 'leading-relaxed'}
                >
                  {p}
                </p>
              ))}
            </div>

            {/* Tags Strip */}
            {article.tags && (
              <div className="pt-4 border-t border-slate-border flex flex-wrap items-center gap-2">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded bg-surface-container text-xs text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            

            
          </main>

          {/* Right Sidebar (4 cols): Related Stories, Editor Desk, Trending */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Related Stories */}
            <div className="bg-surface-pure rounded p-4 shadow-sm border border-slate-border">
              <h3 className="font-headline text-base font-bold text-ink-midnight pb-2 border-b border-slate-border mb-3 uppercase tracking-wide">
                RELATED STORIES
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-2.5 sm:gap-3">
                {relatedArticles.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/article/${rel.id}`}
                    className="flex flex-col lg:flex-row gap-2 lg:gap-3 group bg-slate-50/50 lg:bg-transparent rounded-lg border border-slate-200/60 lg:border-0 p-2 lg:p-0 hover:bg-slate-100/60 transition"
                  >
                    <div className="w-full lg:w-20 aspect-[16/10] lg:aspect-auto lg:h-16 rounded overflow-hidden shrink-0 bg-slate-100 border border-slate-200 relative">
                      {rel.imageUrl ? (
                        <img
                          src={rel.imageUrl}
                          alt={rel.title}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.parentElement?.querySelector('.fallback-badge') as HTMLElement;
                            if (fallback) fallback.classList.remove('hidden');
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : null}
                      <div className={`fallback-badge w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-[10px] ${rel.imageUrl ? 'hidden' : ''}`}>
                        NEWS
                      </div>
                    </div>
                    <div className="flex flex-col justify-between flex-1">
                      <h4 className="text-[11px] sm:text-xs font-semibold text-ink-midnight group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                        {rel.title}
                      </h4>
                      <span className="text-[9px] sm:text-[10px] text-secondary mt-1 block">
                        {rel.category} • {rel.timeAgo}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Author Profile Card */}
            <div className="bg-surface-pure rounded p-5 shadow-sm border border-slate-border text-center">
              <h4 className="text-xs font-bold text-secondary uppercase tracking-widest mb-3 pb-2 border-b border-slate-border">
                ABOUT THE REPORTER
              </h4>
              <img
                src={
                  article.author.avatar && !article.author.avatar.includes('534528741775')
                    ? article.author.avatar
                    : 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=400&q=80'
                }
                alt={article.author.name}
                onError={(e) => {
                  e.currentTarget.src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23C8102E' rx='50'/%3E%3Ctext x='50' y='58' font-size='34' font-family='sans-serif' font-weight='bold' fill='white' text-anchor='middle'%3EKD%3C/text%3E%3C/svg%3E";
                }}
                className="w-16 h-16 rounded-full object-cover mx-auto ring-2 ring-primary mb-2 shadow-xs"
              />
              <h4 className="font-headline text-base font-bold text-ink-midnight">
                {(article.author.name?.toLowerCase().includes('editor') || article.author.name?.toLowerCase().includes('chief'))
                  ? 'എഡിറ്റർ'
                  : article.author.name || 'കേരളദേശം ന്യൂസ് ഡെസ്ക്'}
              </h4>
              <p className="text-xs text-secondary mb-3">
                {article.author.designation || 'ഡെസ്ക് റിപ്പോർട്ടർ'} • {article.author.location || 'കേരളം'}
              </p>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                കേരളദേശം ഓൺലൈൻ എഡിറ്റോറിയൽ ടീം തയ്യാറാക്കിയ വിശദമായ വാർത്താ റിപ്പോർട്ട്.
              </p>
              <button
                type="button"
                onClick={handleFollowAuthorToggle}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all w-full uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xs active:scale-95 ${
                  isFollowingAuthor
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-ink-midnight hover:bg-primary text-white'
                }`}
              >
                {isFollowingAuthor ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Following Reporter</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Follow Reporter</span>
                  </>
                )}
              </button>
            </div>
          </aside>
        </div>
      </div>

      {/* Floating Action Feedback Toast */}
      {feedbackToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs sm:text-sm font-bold px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{feedbackToast}</span>
        </div>
      )}
    </div>
  );
}
