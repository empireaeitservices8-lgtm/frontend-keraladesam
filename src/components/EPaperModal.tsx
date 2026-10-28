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
  ExternalLink,
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
  sectionKey:
    | 'top'
    | 'regional'
    | 'politics'
    | 'special'
    | 'business'
    | 'cinema'
    | 'sports_world'
    | 'editorial';
}

const PAGE_SECTIONS: PageSection[] = [
  {
    page: 1,
    title: 'ഒന്നാം പേജ് • പ്രധാന വാർത്തകൾ',
    subtitle: 'Page 1 • Top Stories & State Lead',
    sectionKey: 'top',
  },
  {
    page: 2,
    title: 'പ്രാദേശിക വാർത്തകൾ',
    subtitle: 'Page 2 • Regional & District Edition',
    sectionKey: 'regional',
  },
  {
    page: 3,
    title: 'രാഷ്ട്രീയം & ഭരണരംഗം',
    subtitle: 'Page 3 • Politics & Governance',
    sectionKey: 'politics',
  },
  {
    page: 4,
    title: 'പ്രത്യേക അന്വേഷണം',
    subtitle: 'Page 4 • Special Investigations & In-depth',
    sectionKey: 'special',
  },
  {
    page: 5,
    title: 'ബിസിനസ് & വിപണി',
    subtitle: 'Page 5 • Business, Markets & Economy',
    sectionKey: 'business',
  },
  {
    page: 6,
    title: 'സിനിമ & സാംസ്കാരികം',
    subtitle: 'Page 6 • Cinema, Arts & Entertainment',
    sectionKey: 'cinema',
  },
  {
    page: 7,
    title: 'സ്പോർട്സ് & ലോകം',
    subtitle: 'Page 7 • Sports & World Arena',
    sectionKey: 'sports_world',
  },
  {
    page: 8,
    title: 'എഡിറ്റോറിയൽ & അഭിപ്രായം',
    subtitle: 'Page 8 • Editorial & Opinion Columns',
    sectionKey: 'editorial',
  },
];

interface EditionOption {
  id: string;
  name: string;
  shortName: string;
  mastheadTitle: string;
  districts: string[];
}

const EDITIONS: EditionOption[] = [
  {
    id: 'kochi',
    name: 'കൊച്ചി (Kochi)',
    shortName: 'KOCHI',
    mastheadTitle: 'Kochi Edition (കൊച്ചി പതിപ്പ്)',
    districts: ['കൊച്ചി', 'എറണാകുളം', 'തൃശ്ശൂർ', 'കോട്ടയം', 'ഇടുക്കി', 'ആലപ്പുഴ'],
  },
  {
    id: 'tvm',
    name: 'തിരുവനന്തപുരം (Thiruvananthapuram)',
    shortName: 'TVM',
    mastheadTitle: 'Thiruvananthapuram Edition (തിരുവനന്തപുരം പതിപ്പ്)',
    districts: ['തിരുവനന്തപുരം', 'കൊല്ലം', 'പത്തനംതിട്ട', 'ആലപ്പുഴ'],
  },
  {
    id: 'calicut',
    name: 'കോഴിക്കോട് (Kozhikode)',
    shortName: 'KOZHIKODE',
    mastheadTitle: 'Kozhikode Edition (കോഴിക്കോട് പതിപ്പ്)',
    districts: ['കോഴിക്കോട്', 'മലപ്പുറം', 'വയനാട്', 'കണ്ണൂർ', 'കാസർഗോഡ്', 'പാലക്കാട്'],
  },
  {
    id: 'gulf',
    name: 'ഗൾഫ് & പ്രവാസി (Gulf & NRI)',
    shortName: 'GULF',
    mastheadTitle: 'Gulf & NRI Edition (ഗൾഫ് / പ്രവാസി പതിപ്പ്)',
    districts: ['പ്രവാസം / ഗൾഫ്', 'പ്രവാസം', 'ഗൾഫ്', 'യു.എ.ഇ', 'ഖത്തർ', 'സൗദി', 'കുവൈറ്റ്', 'ഒമാൻ', 'ബഹ്‌റൈൻ'],
  },
  {
    id: 'global',
    name: 'Global (AU / CA / UK / USA)',
    shortName: 'GLOBAL',
    mastheadTitle: 'Global Overseas Edition (ആഗോള പതിപ്പ്)',
    districts: ['അന്തർദേശീയം', 'അന്താരാഷ്ട്രം', 'ലോകം', 'യുകെ', 'അമേരിക്ക', 'കാനഡ', 'ഓസ്ട്രേലിയ'],
  },
];

function matchesSection(
  art: Article,
  sectionKey: PageSection['sectionKey'],
  editionDistricts: string[]
): boolean {
  const cat = (art.category || '').toLowerCase();
  const title = (art.title || '').toLowerCase();
  const dist = (art.district || '').toLowerCase();
  const tags = (art.tags || []).map((t) => t.toLowerCase()).join(' ');

  switch (sectionKey) {
    case 'top':
      return Boolean(art.isHeadline || art.breaking);

    case 'regional':
      if (editionDistricts.some((d) => dist.includes(d.toLowerCase()))) return true;
      return Boolean(dist && dist !== 'ദേശീയം' && dist !== 'അന്തർദേശീയം');

    case 'politics':
      return (
        cat.includes('രാഷ്ട്രീയ') ||
        cat.includes('ഭരണ') ||
        cat.includes('നിയമസഭ') ||
        cat.includes('പാർലമെന്റ്') ||
        cat.includes('തെരഞ്ഞെടുപ്പ്') ||
        cat.includes('politic') ||
        tags.includes('politic') ||
        title.includes('നിയമസഭ') ||
        title.includes('മന്ത്രി')
      );

    case 'special':
      return (
        cat.includes('പ്രത്യേക') ||
        cat.includes('അന്വേഷണ') ||
        cat.includes('വികസന') ||
        cat.includes('നഗരവികസന') ||
        cat.includes('ക്രമസമാധാന') ||
        cat.includes('special') ||
        tags.includes('special')
      );

    case 'business':
      return (
        cat.includes('ബിസിനസ്') ||
        cat.includes('വിപണി') ||
        cat.includes('സ്വർണ്ണ') ||
        cat.includes('സമ്പദ്') ||
        cat.includes('ബാങ്കിംഗ്') ||
        cat.includes('വ്യവസായം') ||
        cat.includes('സ്റ്റാർട്ടപ്പ്') ||
        cat.includes('business') ||
        cat.includes('economy') ||
        tags.includes('business')
      );

    case 'cinema':
      return (
        cat.includes('സിനിമ') ||
        cat.includes('സാംസ്കാരിക') ||
        cat.includes('വിനോദം') ||
        cat.includes('ബോക്സ്') ||
        cat.includes('റിലീസ്') ||
        cat.includes('ഒ.ടി.ടി') ||
        cat.includes('cinema') ||
        tags.includes('cinema') ||
        tags.includes('film')
      );

    case 'sports_world':
      return (
        cat.includes('സ്പോർട്സ്') ||
        cat.includes('കായികം') ||
        cat.includes('ക്രിക്കറ്റ്') ||
        cat.includes('ഫുട്ബോൾ') ||
        cat.includes('ലോകം') ||
        cat.includes('അന്തർദേശീയ') ||
        cat.includes('അന്താരാഷ്ട്ര') ||
        cat.includes('പ്രവാസം') ||
        cat.includes('ഗൾഫ്') ||
        cat.includes('sport') ||
        cat.includes('world') ||
        cat.includes('international') ||
        dist.includes('അന്തർദേശീയം') ||
        dist.includes('പ്രവാസം')
      );

    case 'editorial':
      return (
        cat.includes('അഭിപ്രായം') ||
        cat.includes('എഡിറ്റോറിയൽ') ||
        cat.includes('വിശകലനം') ||
        cat.includes('മുഖപ്രസംഗം') ||
        cat.includes('കാഴ്ചപ്പാട്') ||
        cat.includes('ലേഖനം') ||
        cat.includes('opinion') ||
        tags.includes('opinion')
      );

    default:
      return true;
  }
}

interface PageData {
  leadArticle: Article | null;
  sideArticles: Article[];
  bulletinBriefs: Article[];
}

export default function EPaperModal({ isOpen, onClose }: EPaperModalProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [selectedEdition, setSelectedEdition] = useState('kochi');
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const totalPages = PAGE_SECTIONS.length;
  const currentEditionConfig =
    EDITIONS.find((ed) => ed.id === selectedEdition) || EDITIONS[0];

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

  // Clean and sort daily articles (newest first, headlines at the very top)
  const dailyArticles = useMemo(() => {
    if (!articles || articles.length === 0) return [];
    return [...articles].sort((a, b) => {
      if (a.isHeadline && !b.isHeadline) return -1;
      if (!a.isHeadline && b.isHeadline) return 1;
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  }, [articles]);

  // Distribute stories across all 8 pages without duplicates or static slices
  const pagesData = useMemo<PageData[]>(() => {
    if (dailyArticles.length === 0) {
      return PAGE_SECTIONS.map(() => ({
        leadArticle: null,
        sideArticles: [],
        bulletinBriefs: [],
      }));
    }

    const usedLeadIds = new Set<string>();
    const results: PageData[] = [];

    PAGE_SECTIONS.forEach((section, pageIndex) => {
      // 1. Pick a distinctive lead article matching this section
      const candidates = dailyArticles.filter(
        (a) =>
          !usedLeadIds.has(a.id) &&
          matchesSection(a, section.sectionKey, currentEditionConfig.districts)
      );

      let lead: Article | undefined = candidates[0];
      if (!lead) {
        // Fallback to any unused article
        lead =
          dailyArticles.find((a) => !usedLeadIds.has(a.id)) ||
          dailyArticles[pageIndex % dailyArticles.length];
      }

      if (lead) {
        usedLeadIds.add(lead.id);
      }

      // 2. Pick 2 side articles (matching section first, then other available)
      const leadId = lead ? lead.id : '';
      const sidePool = [
        ...candidates.filter((a) => a.id !== leadId),
        ...dailyArticles.filter(
          (a) =>
            a.id !== leadId &&
            matchesSection(a, section.sectionKey, currentEditionConfig.districts)
        ),
        ...dailyArticles.filter((a) => a.id !== leadId && !usedLeadIds.has(a.id)),
        ...dailyArticles.filter((a) => a.id !== leadId),
      ];

      const sides: Article[] = [];
      for (const item of sidePool) {
        if (sides.length >= 2) break;
        if (!sides.some((s) => s.id === item.id)) {
          sides.push(item);
        }
      }

      // 3. Pick 4 bulletin briefs: must NOT duplicate lead or side articles on this page
      const onThisPageIds = new Set([leadId, ...sides.map((s) => s.id)]);
      const briefsPool = dailyArticles.filter((a) => !onThisPageIds.has(a.id));

      // Rotate start index across pages so briefs are fresh on each page
      const startIndex = (pageIndex * 3) % Math.max(1, briefsPool.length);
      const briefs: Article[] = [];
      for (let i = 0; i < briefsPool.length && briefs.length < 4; i++) {
        const item = briefsPool[(startIndex + i) % briefsPool.length];
        if (!briefs.some((b) => b.id === item.id)) {
          briefs.push(item);
        }
      }

      results.push({
        leadArticle: lead || null,
        sideArticles: sides,
        bulletinBriefs: briefs,
      });
    });

    return results;
  }, [dailyArticles, currentEditionConfig]);

  const currentPageData = pagesData[currentPage - 1] || {
    leadArticle: null,
    sideArticles: [],
    bulletinBriefs: [],
  };
  const { leadArticle, sideArticles, bulletinBriefs } = currentPageData;
  const currentSection = PAGE_SECTIONS[currentPage - 1] || PAGE_SECTIONS[0];

  // Authentic Malayalam Newspaper Date String
  const malayalamDateStr = useMemo(() => {
    const d = new Date();
    const days = [
      'ഞായറാഴ്ച',
      'തിങ്കളാഴ്ച',
      'ചൊവ്വാഴ്ച',
      'ബുധനാഴ്ച',
      'വ്യാഴാഴ്ച',
      'വെള്ളിയാഴ്ച',
      'ശനിയാഴ്ച',
    ];
    const months = [
      'ജനുവരി',
      'ഫെബ്രുവരി',
      'മാർച്ച്',
      'ഏപ്രിൽ',
      'മേയ്',
      'ജൂൺ',
      'ജൂലൈ',
      'ഓഗസ്റ്റ്',
      'സെപ്റ്റംബർ',
      'ഒക്ടോബർ',
      'നവംബർ',
      'ഡിസംബർ',
    ];
    return `${d.getFullYear()} ${months[d.getMonth()]} ${d.getDate()}, ${days[d.getDay()]}`;
  }, []);

  const issueNumber = useMemo(() => {
    const d = new Date();
    const start = new Date(d.getFullYear(), 0, 0);
    const diff =
      d.getTime() -
      start.getTime() +
      (start.getTimezoneOffset() - d.getTimezoneOffset()) * 60 * 1000;
    return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)));
  }, []);

  // Filter out any lead summary text duplicated in body paragraphs
  const bodyParagraphs = useMemo(() => {
    if (!leadArticle) return [];
    const leadClean = (leadArticle.lead || '').trim();
    const list = (
      leadArticle.paragraphs && leadArticle.paragraphs.length > 0
        ? leadArticle.paragraphs
        : [leadArticle.lead]
    ).filter((p) => Boolean(p && p.trim()));

    const filtered = list.filter((p) => {
      const clean = p.trim();
      if (!clean) return false;
      if (clean === leadClean) return false;
      if (leadClean.length > 30 && clean.startsWith(leadClean.slice(0, 30))) return false;
      return true;
    });

    return filtered.slice(0, 5);
  }, [leadArticle]);

  const handleArticleClick = (art: Article) => {
    const targetId = art._id || art.id || art.customId;
    if (targetId && typeof window !== 'undefined') {
      window.open(`/article/${targetId}`, '_blank');
    }
  };

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
                {malayalamDateStr}
              </span>
              <span>•</span>
              <span className="text-secondary-fixed font-semibold">
                {currentEditionConfig.mastheadTitle}
              </span>
            </div>
          </div>
        </div>

        {/* Edition Switcher Dropdown */}
        <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1.5 rounded-lg border border-white/10 text-xs font-semibold">
          <span className="text-[11px] text-white/70 uppercase tracking-wider hidden sm:inline">
            EDITION:
          </span>
          <select
            value={selectedEdition}
            onChange={(e) => setSelectedEdition(e.target.value)}
            className="bg-editorial-crimson text-white font-bold px-2.5 py-0.5 rounded text-[11px] shadow-xs uppercase tracking-wider cursor-pointer focus:outline-none border-0"
            title="പതിപ്പ് തിരഞ്ഞെടുക്കുക"
          >
            {EDITIONS.map((ed) => (
              <option key={ed.id} value={ed.id} className="bg-ink-midnight text-white text-xs">
                {ed.name}
              </option>
            ))}
          </select>
        </div>

        {/* Page Nav & Zoom Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Page Jump Pills */}
          <div className="hidden xl:flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
            {PAGE_SECTIONS.map((sec) => (
              <button
                key={sec.page}
                onClick={() => setCurrentPage(sec.page)}
                className={`w-6 h-6 rounded text-xs font-bold transition-colors ${
                  currentPage === sec.page
                    ? 'bg-editorial-crimson text-white'
                    : 'text-white/70 hover:bg-white/20'
                }`}
                title={sec.title}
              >
                {sec.page}
              </button>
            ))}
          </div>

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
            <div className="flex flex-wrap items-center justify-between text-[11px] border-b border-ink-midnight/40 pb-2 mb-3 text-slate-700 gap-1 font-serif">
              <span>വാല്യം 18 • ലക്കം {issueNumber}</span>
              <span className="font-bold text-slate-900">{malayalamDateStr}</span>
              <span>വില: ₹7.00 • പേജ്: {currentPage} / {totalPages}</span>
              <span className="font-bold text-editorial-crimson uppercase">
                {currentEditionConfig.mastheadTitle}
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
                    <h1
                      onClick={() => handleArticleClick(leadArticle)}
                      className="font-headline text-2xl sm:text-3xl font-black text-ink-midnight leading-tight tracking-tight hover:text-primary transition-colors cursor-pointer"
                      title="പൂർണ്ണരൂപം വായിക്കാൻ ക്ലിക്ക് ചെയ്യുക"
                    >
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
                      <span
                        onClick={() => handleArticleClick(leadArticle)}
                        className="ml-auto text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        പൂർണ്ണരൂപം <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-1">
                    {/* Main Story Column */}
                    <div className="md:col-span-8">
                      {leadArticle.imageUrl ? (
                        <div
                          className="mb-3 cursor-pointer group"
                          onClick={() => handleArticleClick(leadArticle)}
                        >
                          <img
                            src={leadArticle.imageUrl}
                            alt={leadArticle.title}
                            className="w-full h-64 object-cover rounded-xs border border-slate-300 group-hover:opacity-95 transition-opacity"
                          />
                          <p className="text-[11px] text-slate-500 italic mt-1 bg-slate-50 p-1 border-l-2 border-slate-300">
                            {leadArticle.imageCaption || leadArticle.title}
                          </p>
                        </div>
                      ) : null}

                      <div className="columns-1 sm:columns-2 gap-4 text-xs leading-relaxed text-justify text-slate-800 font-serif">
                        {leadArticle.lead && (
                          <p className="mb-2.5 font-bold text-slate-900 leading-snug text-[13px] border-b border-slate-200 pb-2">
                            {leadArticle.lead}
                          </p>
                        )}
                        {bodyParagraphs.length > 0 ? (
                          bodyParagraphs.map((p, idx) => (
                            <p key={idx} className="mb-2 indent-3">
                              {p}
                            </p>
                          ))
                        ) : (
                          <p className="mb-2">
                            {leadArticle.lead}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Side Column Stories */}
                    <div className="md:col-span-4 bg-slate-50/80 p-3 rounded-xs border border-slate-200 flex flex-col justify-between">
                      <div className="space-y-4">
                        {sideArticles[0] && (
                          <div
                            onClick={() => handleArticleClick(sideArticles[0])}
                            className="pb-3 border-b border-slate-200 group cursor-pointer"
                          >
                            <span
                              className="text-[10px] font-bold uppercase inline-block px-1.5 py-0.5 rounded-2xs text-white mb-1 tracking-wider"
                              style={{
                                backgroundColor: sideArticles[0].categoryColor || '#C8102E',
                              }}
                            >
                              {sideArticles[0].category || 'പ്രധാനം'}
                            </span>
                            <h4 className="font-headline text-sm font-bold text-ink-midnight mb-1.5 leading-snug group-hover:text-primary transition-colors">
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
                        )}

                        {sideArticles[1] && (
                          <div
                            onClick={() => handleArticleClick(sideArticles[1])}
                            className="group cursor-pointer"
                          >
                            <span
                              className="text-[10px] font-bold uppercase inline-block px-1.5 py-0.5 rounded-2xs text-white mb-1 tracking-wider"
                              style={{
                                backgroundColor: sideArticles[1].categoryColor || '#C8102E',
                              }}
                            >
                              {sideArticles[1].category || 'വാർത്ത'}
                            </span>
                            <h4 className="font-headline text-sm font-bold text-ink-midnight mb-1.5 leading-snug group-hover:text-primary transition-colors">
                              {sideArticles[1].title}
                            </h4>
                            {sideArticles[1].imageUrl && (
                              <img
                                src={sideArticles[1].imageUrl}
                                alt={sideArticles[1].title}
                                className="w-full h-28 object-cover rounded-xs mb-1.5 border border-slate-200"
                              />
                            )}
                            <p className="text-xs text-slate-700 leading-relaxed font-serif line-clamp-3">
                              {sideArticles[1].lead}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Malayalam Newspaper Page Footer Box */}
                      <div className="mt-4 pt-3 border-t border-slate-300 text-center bg-white p-2.5 border rounded-xs shadow-xs">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider font-sans">
                          കേരളദേശം ദിനപത്രം • {currentEditionConfig.shortName}
                        </span>
                        <p className="text-xs font-bold text-primary mt-0.5 font-sans">
                          വാർത്തകൾ തത്സമയം അറിയാൻ വെബ്‌സൈറ്റ് സന്ദർശിക്കുക
                        </p>
                        <span className="text-[10px] text-slate-600 font-sans">
                          kerala-dhesam.vercel.app • 24x7 Digital Edition
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Daily Bulletin Summary Row */}
                  {bulletinBriefs.length > 0 && (
                    <div className="mt-4 pt-3 border-t-2 border-double border-ink-midnight/40">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-editorial-crimson animate-pulse" />
                          <span className="font-headline text-xs font-bold text-ink-midnight uppercase tracking-wider">
                            ഇന്നത്തെ പ്രധാന വാർത്തകൾ ചുരുക്കത്തിൽ:
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          പേജ് {currentPage} ബുള്ളറ്റിൻ
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        {bulletinBriefs.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => handleArticleClick(item)}
                            className="p-2.5 bg-slate-50 hover:bg-slate-100/90 border border-slate-200 rounded-xs transition-colors cursor-pointer group flex flex-col justify-between"
                            title="പൂർണ്ണരൂപം വായിക്കാൻ ക്ലിക്ക് ചെയ്യുക"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span
                                  className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-2xs text-white inline-block tracking-wider"
                                  style={{
                                    backgroundColor: item.categoryColor || '#C8102E',
                                  }}
                                >
                                  {item.category || 'വാർത്ത'}
                                </span>
                                {item.district && (
                                  <span className="text-[9px] text-slate-500 font-medium truncate max-w-[80px]">
                                    {item.district}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs font-semibold text-slate-900 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                                {item.title}
                              </p>
                            </div>
                            <span className="text-[10px] text-primary/80 font-medium flex items-center gap-1 mt-2">
                              പൂർണ്ണരൂപം <ExternalLink className="w-2.5 h-2.5" />
                            </span>
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
