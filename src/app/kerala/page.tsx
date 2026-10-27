'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Clock,
  Eye,
  ArrowRight,
  Bookmark,
  TrendingUp,
  MessageCircle
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

  const filteredArticles = articles;

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
              <span className="text-on-surface">ALL DISTRICTS</span>
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
                  onClick={() => setSelectedCategory(cat.label)}
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

          {/* 14 District Quick Filter Pills Bar */}
          <div className="pt-3 mt-1 border-t border-slate-border/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1 text-xs text-secondary shrink-0 pr-1 font-semibold uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5 text-editorial-crimson" />
              <span>DISTRICTS:</span>
            </div>
            <div className="flex items-center gap-1.5 min-w-max pb-1">
              {['All', ...KERALA_DISTRICTS.filter(d => d !== 'എല്ലാം')].map((dist) => (
                <button
                  key={dist}
                  onClick={() => setSelectedDistrict(dist)}
                  className={`px-3 py-1 rounded-full text-xs transition-colors font-medium ${selectedDistrict === dist
                    ? 'bg-ink-midnight text-white font-bold shadow-xs'
                    : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                    }`}
                >
                  {dist}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main District Content Grid */}
      <main className="w-full max-w-[1360px] mx-auto px-4 md:px-margin-desktop py-6">

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Story Feed (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {filteredArticles.length === 0 ? (
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
              filteredArticles.map((art) => (
                <article
                  key={art.id}
                  className="bg-surface-pure rounded p-3.5 sm:p-5 shadow-sm border border-slate-border flex flex-col md:flex-row gap-3.5 sm:gap-5 group"
                >
                  {/* Article Thumbnail */}
                  {art.imageUrl ? (
                    <div className="md:w-5/12 overflow-hidden rounded shrink-0">
                      <img
                        src={art.imageUrl}
                        alt={art.title}
                        className="w-full h-44 sm:h-48 md:h-full object-cover group-hover:scale-105 transition-transform duration-300 rounded"
                      />
                    </div>
                  ) : null}

                  {/* Article Meta & Content */}
                  <div className={`${art.imageUrl ? 'md:w-7/12' : 'w-full'} flex flex-col justify-between`}>
                    <div>
                      <div className="flex items-center justify-between mb-1.5 text-xs">
                        <span
                          className="font-bold uppercase tracking-wider text-[10px] sm:text-[11px]"
                          style={{ color: art.categoryColor }}
                        >
                          {art.category}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-secondary text-[10px] sm:text-[11px] flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {art.timeAgo}
                          </span>
                          <button
                            onClick={() => toggleBookmark(art.id)}
                            className="text-secondary hover:text-primary transition-colors p-1"
                            title="ബുക്ക്‌മാർക്ക്"
                          >
                            <Bookmark
                              className={`w-3.5 h-3.5 ${isBookmarked(art.id) ? 'fill-primary text-primary' : ''
                                }`}
                            />
                          </button>
                        </div>
                      </div>

                      <Link href={`/article/${art.id}`}>
                        <h3 className="font-headline text-base sm:text-lg font-bold text-ink-midnight group-hover:text-primary transition-colors leading-snug mb-2">
                          {art.title}
                        </h3>
                      </Link>

                      <p className="text-xs text-on-surface-variant line-clamp-2 sm:line-clamp-3 leading-relaxed mb-3">
                        {art.lead}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-border text-xs text-secondary">
                      <span className="flex items-center gap-1 font-semibold text-ink-midnight">
                        <MapPin className="w-3 h-3 text-editorial-crimson" />
                        {art.district || 'കേരളം'}
                      </span>

                      <Link
                        href={`/article/${art.id}`}
                        className="text-primary hover:underline font-bold flex items-center gap-1"
                      >
                        Read More <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
