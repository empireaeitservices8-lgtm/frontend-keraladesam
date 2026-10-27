'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import {
  X,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Newspaper,
  Calendar,
  CheckCircle2,
  Loader2,
  Clock,
  MapPin,
} from 'lucide-react';
import { Article } from '@/data/newsData';
import { getRealArticles } from '@/lib/api';

interface EPaperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PageSection {
  page: number;
  title: string;
  subtitle: string;
  category: string;
}

const PAGE_SECTIONS: PageSection[] = [
  { page: 1, title: 'ഒന്നാം പേജ് • പ്രധാന വാർത്തകൾ', subtitle: 'Page 1 • Top Stories & State Lead', category: 'top' },
  { page: 2, title: 'പ്രാദേശിക വാർത്തകൾ', subtitle: 'Page 2 • Regional & District Edition', category: 'regional' },
  { page: 3, title: 'രാഷ്ട്രീയം & ഭരണരംഗം', subtitle: 'Page 3 • Politics & Governance', category: 'രാഷ്ട്രീയം' },
  { page: 4, title: 'പ്രത്യേക അന്വേഷണം', subtitle: 'Page 4 • Special Investigations & In-depth', category: 'പ്രത്യേക റിപ്പോർട്ട്' },
  { page: 5, title: 'ബിസിനസ് & വിപണി', subtitle: 'Page 5 • Business, Markets & Economy', category: 'ബിസിനസ്' },
  { page: 6, title: 'സിനിമ & സാംസ്കാരികം', subtitle: 'Page 6 • Cinema, Arts & Entertainment', category: 'സിനിമ' },
  { page: 7, title: 'സ്പോർട്സ് & ലോകം', subtitle: 'Page 7 • Sports & World Arena', category: 'സ്പോർട്സ്' },
  { page: 8, title: 'എഡിറ്റോറിയൽ & അഭിപ്രായം', subtitle: 'Page 8 • Editorial & Opinion Columns', category: 'അഭിപ്രായം' },
];

export default function EPaperModal({ isOpen, onClose }: EPaperModalProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const selectedEdition = 'kochi';
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const totalPages = PAGE_SECTIONS.length;
  const editionTitle = 'Kochi Edition (കൊച്ചി പതിപ്പ്)';

  // Fetch real articles when modal opens
  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      setLoading(true);
      getRealArticles({ limit: 50 })
        .then((data) => {
          if (isMounted) {
            setArticles(data || []);
            setLoading(false);
          }
        })
        .catch((err) => {
          console.error('Failed to load real articles for e-paper:', err);
          if (isMounted) setLoading(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Daily Published News sorting & filtering
  const dailyArticles = useMemo(() => {
    if (!articles || articles.length === 0) return [];
    // Sort from newest to oldest based on available timestamps
    return [...articles].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  }, [articles]);

  const currentSection = PAGE_SECTIONS[currentPage - 1] || PAGE_SECTIONS[0];

  // Distribute stories per page so each page gets unique, authentic daily content
  const { leadArticle, sideArticles, bulletinBriefs } = useMemo(() => {
    if (dailyArticles.length === 0) {
      return { leadArticle: null, sideArticles: [], bulletinBriefs: [] };
    }

    let filtered: Article[] = [];

    if (currentSection.category === 'top') {
      // Page 1: headlines, breaking or highest ranked articles
      filtered = dailyArticles.filter((a) => a.isHeadline || a.breaking);
      if (filtered.length < 3) {
        filtered = dailyArticles.slice(0, 4);
      }
    } else if (currentSection.category === 'regional') {
      // Page 2: regional filter for Kochi / Ernakulam & Central Kerala
      filtered = dailyArticles.filter(
        (a) =>
          a.district?.includes('കൊച്ചി') ||
          a.district?.includes('എറണാകുളം') ||
          a.district?.includes('തൃശ്ശൂർ') ||
          a.district?.includes('കോട്ടയം')
      );
      // If regional filter yields fewer than 3, supplement with latest state news
      if (filtered.length < 3) {
        const remaining = dailyArticles.filter((a) => !filtered.some((f) => f.id === a.id));
        filtered = [...filtered, ...remaining.slice(0, 3 - filtered.length)];
      }
    } else {
      // Section-specific match
      filtered = dailyArticles.filter(
        (a) =>
          a.category?.toLowerCase().includes(currentSection.category.toLowerCase()) ||
          a.tags?.some((t) => t.toLowerCase().includes(currentSection.category.toLowerCase()))
      );
      // If fewer stories match this exact category, pull distinct stories by page offset
      if (filtered.length < 3) {
        const offset = ((currentPage - 1) * 2) % Math.max(1, dailyArticles.length);
        const sliced = dailyArticles.slice(offset, offset + 3);
        const combined = [...filtered];
        sliced.forEach((item) => {
          if (!combined.some((c) => c.id === item.id)) {
            combined.push(item);
          }
        });
        filtered = combined;
      }
    }

    const lead = filtered[0] || dailyArticles[0] || null;
    const sides = filtered.slice(1, 3);
    const briefs = dailyArticles.slice(3, 7);

    return {
      leadArticle: lead,
      sideArticles: sides,
      bulletinBriefs: briefs,
    };
  }, [dailyArticles, currentSection, selectedEdition, currentPage]);

  const todayDateStr = useMemo(() => {
    return new Date().toLocaleDateString('ml-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      timeZone: 'Asia/Kolkata',
    });
  }, []);

  const currentYear = useMemo(() => new Date().getFullYear(), []);

  const handleDownload = () => {
    setDownloadSuccess(true);
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.print();
      }, 350);
    }
    setTimeout(() => {
      setDownloadSuccess(false);
    }, 4000);
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex flex-col bg-slate-950/95 backdrop-blur-md print:bg-white print:p-0">
      {/* Top Controls Toolbar */}
      <div className="bg-ink-midnight text-white px-4 py-3 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-md print:hidden">
        {/* Title & Date */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-editorial-crimson text-white">
            <Newspaper className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-headline text-base font-bold text-white tracking-wide uppercase">
                KERALA DESAM DIGITAL E-PAPER
              </h2>
              <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                DAILY PDF
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/70">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-secondary-fixed-dim" />
                {currentYear} Daily Edition
              </span>
              <span>•</span>
              <span className="text-secondary-fixed font-semibold">
                {editionTitle}
              </span>
            </div>
          </div>
        </div>

        {/* Edition Badge - Kochi Only */}
        <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 text-xs font-semibold">
          <span className="text-[11px] text-white/70 uppercase tracking-wider">EDITION:</span>
          <span className="bg-editorial-crimson text-white font-bold px-2.5 py-0.5 rounded text-[11px] shadow-xs uppercase tracking-wider">
            KOCHI (കൊച്ചി പതിപ്പ്)
          </span>
        </div>

        {/* Page Nav & Zoom Controls */}
        <div className="flex items-center gap-3">
          {/* Page Navigator */}
          <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-lg border border-white/10 text-xs">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 text-white hover:bg-white/20 rounded disabled:opacity-30 disabled:hover:bg-transparent"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-bold font-mono text-white text-xs">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 text-white hover:bg-white/20 rounded disabled:opacity-30 disabled:hover:bg-transparent"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Zoom Buttons */}
          <div className="hidden sm:flex items-center gap-1 bg-white/10 px-2 py-1 rounded-lg border border-white/10 text-xs">
            <button
              onClick={() => setZoomLevel((z) => Math.max(70, z - 15))}
              className="p-1 text-white hover:bg-white/20 rounded"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-1 text-[11px] font-mono font-medium">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(160, z + 15))}
              className="p-1 text-white hover:bg-white/20 rounded"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(100)}
              className="p-1 text-white/70 hover:text-white hover:bg-white/20 rounded ml-0.5"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Download & Print */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-md hover:bg-editorial-crimson transition-colors shadow-xs uppercase tracking-wider"
            title="Download E-Paper PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">DOWNLOAD PDF</span>
          </button>

          <button
            onClick={handlePrint}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors hidden lg:block"
            title="Print"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Close Modal */}
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors ml-1"
            title="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Newspaper Canvas View */}
      <div className="flex-1 overflow-auto p-3 sm:p-8 flex justify-center items-start">
        <div
          className="bg-white text-ink-midnight shadow-2xl rounded-sm transition-all duration-300 origin-top overflow-hidden border border-slate-300"
          style={{
            width: `${Math.round(880 * (zoomLevel / 100))}px`,
            maxWidth: '100%',
          }}
        >
          {/* Digital Newspaper Page Header */}
          <div className="p-4 sm:p-6 border-b-2 border-ink-midnight bg-[#fffefb]">
            <div className="flex flex-wrap items-center justify-between text-[11px] border-b border-ink-midnight/40 pb-2 mb-3 text-slate-700 gap-1">
              <span>വാല്യം 18 • ലക്കം 84</span>
              <span className="font-semibold text-slate-900">{todayDateStr}</span>
              <span>വില: ₹7.00 • പേജുകൾ: {totalPages}</span>
              <span className="font-bold text-editorial-crimson">
                {editionTitle}
              </span>
            </div>

            {/* Masthead */}
            <div className="text-center py-2 border-b-4 border-double border-ink-midnight">
              <div className="flex items-center justify-center gap-3">
                <div className="relative h-16 w-80">
                  <Image
                    src="/logo.png"
                    alt="കേരളദേശം"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
              <p className="text-[11px] font-serif tracking-widest text-slate-700 uppercase mt-1">
                KERALA DESAM • MALAYALAM DAILY NEWSPAPER
              </p>
            </div>

            {/* Page Section Ribbon */}
            <div className="mt-3">
              <div className="border-b border-ink-midnight/30 pb-2 mb-3 flex items-center justify-between">
                <span className="bg-editorial-crimson text-white text-[11px] font-bold px-2.5 py-0.5 uppercase tracking-wider rounded-xs">
                  {currentSection.title}
                </span>
                <span className="text-[11px] font-serif italic text-slate-600 hidden sm:inline">
                  {currentSection.subtitle}
                </span>
              </div>

              {loading ? (
                <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-500">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <p className="text-xs font-semibold">ഇന്നത്തെ വാർത്തകൾ പത്ര രൂപത്തിലേക്ക് മാറ്റുന്നു...</p>
                </div>
              ) : leadArticle ? (
                /* Newspaper Columns with Real Daily Articles */
                <div className="space-y-4">
                  {/* Lead Headline */}
                  <div>
                    {leadArticle.breaking && (
                      <span className="inline-block bg-red-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-xs uppercase tracking-wider mb-1 mr-2">
                        ബ്രേക്കിംഗ്
                      </span>
                    )}
                    <h1 className="font-headline text-2xl sm:text-3xl font-black text-ink-midnight leading-tight tracking-tight hover:text-primary transition-colors cursor-pointer">
                      {leadArticle.title}
                    </h1>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1.5 pb-2 border-b border-slate-200">
                      <span className="font-bold text-slate-700">
                        {leadArticle.author?.name || 'കേരളദേശം ന്യൂസ് ബ്യൂറോ'}
                      </span>
                      {leadArticle.district && (
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-3 h-3 text-primary" />
                          {leadArticle.district}
                        </span>
                      )}
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-3 h-3" />
                        {leadArticle.timeAgo || 'ഇന്ന്'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-1">
                    {/* Main Story Column */}
                    <div className="md:col-span-8">
                      {leadArticle.imageUrl ? (
                        <div className="mb-3">
                          <img
                            src={leadArticle.imageUrl}
                            alt={leadArticle.title}
                            className="w-full h-64 object-cover rounded-xs border border-slate-300"
                          />
                          <p className="text-[11px] text-slate-500 italic mt-1 bg-slate-50 p-1 border-l-2 border-slate-300">
                            {leadArticle.imageCaption || leadArticle.title}
                          </p>
                        </div>
                      ) : null}

                      <div className="columns-1 sm:columns-2 gap-4 text-xs leading-relaxed text-justify text-slate-800 font-serif">
                        <p className="mb-2 font-bold text-slate-900 leading-snug">
                          {leadArticle.lead}
                        </p>
                        {(leadArticle.paragraphs && leadArticle.paragraphs.length > 0
                          ? leadArticle.paragraphs.slice(0, 5)
                          : [leadArticle.lead]
                        ).map((p, idx) => (
                          <p key={idx} className="mb-2">
                            {p}
                          </p>
                        ))}
                      </div>
                    </div>

                    {/* Side Column Stories */}
                    <div className="md:col-span-4 bg-slate-50/80 p-3 rounded-xs border border-slate-200 flex flex-col justify-between">
                      <div className="space-y-4">
                        {sideArticles[0] ? (
                          <div className="pb-3 border-b border-slate-200">
                            <span className="text-[10px] font-bold uppercase text-editorial-crimson block mb-1 tracking-wider">
                              {sideArticles[0].category || 'പ്രധാനം'}
                            </span>
                            <h4 className="font-headline text-sm font-bold text-ink-midnight mb-1.5 leading-snug hover:text-primary cursor-pointer">
                              {sideArticles[0].title}
                            </h4>
                            {sideArticles[0].imageUrl && (
                              <img
                                src={sideArticles[0].imageUrl}
                                alt={sideArticles[0].title}
                                className="w-full h-28 object-cover rounded-xs mb-1.5 border border-slate-200"
                              />
                            )}
                            <p className="text-xs text-slate-700 leading-relaxed font-serif line-clamp-3">
                              {sideArticles[0].lead}
                            </p>
                          </div>
                        ) : null}

                        {sideArticles[1] ? (
                          <div>
                            <span className="text-[10px] font-bold uppercase text-editorial-crimson block mb-1 tracking-wider">
                              {sideArticles[1].category || 'വാർത്ത'}
                            </span>
                            <h4 className="font-headline text-sm font-bold text-ink-midnight mb-1.5 leading-snug hover:text-primary cursor-pointer">
                              {sideArticles[1].title}
                            </h4>
                            <p className="text-xs text-slate-700 leading-relaxed font-serif line-clamp-3">
                              {sideArticles[1].lead}
                            </p>
                          </div>
                        ) : null}
                      </div>

                      {/* Malayalam Newspaper Page Footer Box */}
                      <div className="mt-4 pt-3 border-t border-slate-300 text-center bg-white p-2 border">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">
                          കേരളദേശം ദിനപത്രം • {editionTitle}
                        </span>
                        <p className="text-xs font-bold text-primary mt-1">
                          വാർത്തകൾ തത്സമയം അറിയാൻ വെബ്‌സൈറ്റ് സന്ദർശിക്കുക
                        </p>
                        <span className="text-[10px] text-slate-600">
                          keraladesam.com • 24x7 Digital Edition
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Daily Bulletin Summary Row */}
                  {bulletinBriefs.length > 0 && (
                    <div className="mt-4 pt-3 border-t-2 border-double border-ink-midnight/40">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 rounded-full bg-editorial-crimson" />
                        <span className="font-headline text-xs font-bold text-ink-midnight uppercase tracking-wider">
                          ഇന്നത്തെ മറ്റു പ്രധാന വാർത്തകൾ ചുരുക്കത്തിൽ:
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        {bulletinBriefs.map((item) => (
                          <div key={item.id} className="p-2 bg-slate-50 border border-slate-200 rounded-xs">
                            <span className="text-[9px] font-bold uppercase text-primary block mb-0.5">
                              {item.category}
                            </span>
                            <p className="text-xs font-semibold text-slate-900 line-clamp-2 leading-snug">
                              {item.title}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-20 text-center text-slate-500 text-xs">
                  ഇന്നത്തെ വാർത്തകൾ ലഭ്യമല്ല.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Download Success Toast */}
      {downloadSuccess && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-emerald-700 text-white text-xs font-bold px-4 py-3 rounded-lg shadow-2xl z-50 animate-in fade-in flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>കേരളദേശം ഇ-പേപ്പർ PDF ഡൗൺലോഡ് വിജയകരമായി ആരംഭിച്ചു!</span>
        </div>
      )}
    </div>
  );
}
