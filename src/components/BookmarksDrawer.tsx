'use client';

import React from 'react';
import Link from 'next/link';
import {
  Bookmark,
  X,
  Trash2,
  ArrowRight,
  Clock,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { useFont } from './FontContext';
import { Article } from '@/data/newsData';
import { getRealArticles } from '@/lib/api';

interface BookmarksDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BookmarksDrawer({ isOpen, onClose }: BookmarksDrawerProps) {
  const { savedArticles, toggleBookmark } = useFont();
  const [allArticles, setAllArticles] = React.useState<Article[]>([]);
  const [isMounted, setIsMounted] = React.useState(false);
  const [followedMap, setFollowedMap] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    setIsMounted(true);
    if (isOpen) {
      getRealArticles().then((data) => setAllArticles(data)).catch(console.error);
      const map: Record<string, boolean> = {};
      savedArticles.forEach((id) => {
        try {
          if (typeof window !== 'undefined' && localStorage.getItem(`kd_followed_${id}`)) {
            map[id] = true;
          }
        } catch {}
      });
      setFollowedMap(map);
    }
  }, [isOpen, savedArticles]);

  if (!isOpen) return null;

  // Retrieve saved article objects
  const bookmarkedList = allArticles.filter((article) =>
    savedArticles.includes(article.id)
  );

  const handleClearAll = () => {
    savedArticles.forEach((id) => toggleBookmark(id));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Drawer Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-surface-pure shadow-2xl border-l border-slate-border flex flex-col justify-between">
          {/* Header */}
          <div className="px-5 py-4 bg-ink-midnight text-white flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-full bg-editorial-crimson/90 text-white">
                <Bookmark className="w-4 h-4 fill-white" />
              </div>
              <div>
                <h3 className="font-headline text-base font-bold text-white flex items-center gap-2 uppercase tracking-wide">
                  SAVED STORIES
                  <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-mono">
                    {savedArticles.length}
                  </span>
                </h3>
                <span className="text-[11px] text-white/70">
                  Your reading list
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Articles Content List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 divide-y divide-slate-border/60">
            {bookmarkedList.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center h-full py-12 px-4">
                <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-secondary mb-4">
                  <Bookmark className="w-8 h-8 text-secondary/60" />
                </div>
                <h4 className="font-headline text-base font-bold text-ink-midnight mb-1 uppercase tracking-wide">
                  NO SAVED STORIES
                </h4>
                <p className="text-xs text-secondary leading-relaxed max-w-xs mb-6">
                  വാർത്തകൾ വായിക്കുമ്പോൾ മുകളിൽ കാണുന്ന <strong>ബുക്ക്‌മാർക്ക്</strong> ഐക്കണിൽ ക്ലിക്ക് ചെയ്ത് പിന്നീട് വായിക്കാനായി ഇവിടെ എളുപ്പത്തിൽ സൂക്ഷിക്കാം.
                </p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-md shadow-xs hover:bg-editorial-crimson transition-colors uppercase tracking-wider"
                >
                  START READING
                </button>
              </div>
            ) : (
              bookmarkedList.map((item) => (
                <div
                  key={item.id}
                  className="pt-3.5 first:pt-0 flex items-start gap-3 group transition-colors"
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-20 h-20 rounded-lg object-cover ring-1 ring-slate-border shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-slate-100 ring-1 ring-slate-border shrink-0 flex items-center justify-center text-slate-400 font-bold text-[10px]">
                      NEWS
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span className="text-[10px] font-bold uppercase text-editorial-crimson block">
                        {item.category}
                      </span>
                      {isMounted && followedMap[item.id] && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-bold border border-emerald-200">
                          🔔 ഫോളോ ചെയ്യുന്നു
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/article/${item.id}`}
                      onClick={onClose}
                      className="font-headline text-xs sm:text-sm font-bold text-ink-midnight line-clamp-2 hover:text-primary transition-colors leading-snug mb-1.5 block"
                    >
                      {item.title}
                    </Link>

                    <div className="flex items-center justify-between text-[11px] text-secondary">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {item.timeAgo}
                      </span>

                      <button
                        onClick={() => toggleBookmark(item.id)}
                        className="text-secondary hover:text-editorial-crimson transition-colors p-1 rounded"
                        title="Remove from saved"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Bar */}
          {bookmarkedList.length > 0 && (
            <div className="p-4 bg-surface-container-low border-t border-slate-border flex items-center justify-between text-xs">
              <button
                onClick={handleClearAll}
                className="text-secondary hover:text-editorial-crimson font-medium flex items-center gap-1 transition-colors uppercase tracking-wider text-[11px]"
              >
                <Trash2 className="w-3.5 h-3.5" /> CLEAR ALL
              </button>

              <button
                onClick={onClose}
                className="px-4 py-2 bg-primary text-white font-bold rounded shadow-xs hover:bg-editorial-crimson transition-colors uppercase tracking-wider text-[11px]"
              >
                DONE
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
