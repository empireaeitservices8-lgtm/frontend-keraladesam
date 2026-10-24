'use client';

import React, { useState } from 'react';
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
  FileText
} from 'lucide-react';

interface EPaperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EPaperModal({ isOpen, onClose }: EPaperModalProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [selectedEdition, setSelectedEdition] = useState<'kochi' | 'tvm' | 'calicut' | 'gulf'>('kochi');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const totalPages = 8;

  const editionNames = {
    kochi: 'കൊച്ചി പതിപ്പ്',
    tvm: 'തിരുവനന്തപുരം പതിപ്പ്',
    calicut: 'കോഴിക്കോട് പതിപ്പ്',
    gulf: 'ഗൾഫ് & പ്രവാസി പതിപ്പ്',
  };

  const handleDownload = () => {
    setDownloadSuccess(true);
    setTimeout(() => {
      setDownloadSuccess(false);
    }, 3000);
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex flex-col bg-slate-950/95 backdrop-blur-md">
      {/* Top Controls Toolbar */}
      <div className="bg-ink-midnight text-white px-4 py-3 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-md">
        {/* Title & Date */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-editorial-crimson text-white">
            <Newspaper className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-headline text-base font-bold text-white tracking-wide">
                കേരളദേശം ഡിജിറ്റൽ ഇ-പേപ്പർ
              </h2>
              <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                PDF
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/70">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-secondary-fixed-dim" />
                2025 മാർച്ച് 29, ശനി
              </span>
              <span>•</span>
              <span className="text-secondary-fixed font-semibold">
                {editionNames[selectedEdition]}
              </span>
            </div>
          </div>
        </div>

        {/* Edition Switcher */}
        <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-lg border border-white/10 text-xs">
          <span className="text-[11px] text-white/70 px-1 hidden md:inline">പതിപ്പ്:</span>
          {(['kochi', 'tvm', 'calicut', 'gulf'] as const).map((ed) => (
            <button
              key={ed}
              onClick={() => setSelectedEdition(ed)}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                selectedEdition === ed
                  ? 'bg-editorial-crimson text-white font-bold shadow-xs'
                  : 'text-white/80 hover:bg-white/10'
              }`}
            >
              {ed === 'kochi'
                ? 'കൊച്ചി'
                : ed === 'tvm'
                ? 'തിരുവനന്തപുരം'
                : ed === 'calicut'
                ? 'കോഴിക്കോട്'
                : 'ഗൾഫ്'}
            </button>
          ))}
        </div>

        {/* Page Nav & Zoom Controls */}
        <div className="flex items-center gap-3">
          {/* Page Navigator */}
          <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-lg border border-white/10 text-xs">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 text-white hover:bg-white/20 rounded disabled:opacity-30 disabled:hover:bg-transparent"
              title="മുൻപത്തെ പേജ്"
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
              title="അടുത്ത പേജ്"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Zoom Buttons */}
          <div className="hidden sm:flex items-center gap-1 bg-white/10 px-2 py-1 rounded-lg border border-white/10 text-xs">
            <button
              onClick={() => setZoomLevel((z) => Math.max(70, z - 15))}
              className="p-1 text-white hover:bg-white/20 rounded"
              title="സൂം കുറയ്ക്കുക"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-1 text-[11px] font-mono font-medium">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(160, z + 15))}
              className="p-1 text-white hover:bg-white/20 rounded"
              title="സൂം കൂട്ടുക"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(100)}
              className="p-1 text-white/70 hover:text-white hover:bg-white/20 rounded ml-0.5"
              title="യഥാർത്ഥ വലിപ്പം"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Download & Print */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-md hover:bg-editorial-crimson transition-colors shadow-xs"
            title="ഇ-പേപ്പർ ഡൗൺലോഡ് ചെയ്യുക"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">ഡൗൺലോഡ്</span>
          </button>

          <button
            onClick={handlePrint}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors hidden lg:block"
            title="പ്രിന്റ് ചെയ്യുക"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Close Modal */}
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors ml-1"
            title="അടയ്ക്കുക"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Newspaper Canvas View */}
      <div className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center items-start">
        <div
          className="bg-white text-ink-midnight shadow-2xl rounded-sm transition-all duration-300 origin-top overflow-hidden border border-slate-300"
          style={{
            width: `${Math.round(860 * (zoomLevel / 100))}px`,
            maxWidth: '100%',
          }}
        >
          {/* Digital Newspaper Page Header */}
          <div className="p-6 border-b-2 border-ink-midnight bg-[#fffefb]">
            <div className="flex items-center justify-between text-[11px] border-b border-ink-midnight/40 pb-2 mb-3 text-slate-700">
              <span>വാല്യം 18 • ലക്കം 84</span>
              <span>2025 മാർച്ച് 29 ശനി • 1199 മീനം 15</span>
              <span>വില: ₹7.00 • പേജുകൾ: 16</span>
              <span className="font-bold text-editorial-crimson">
                {editionNames[selectedEdition]}
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
                  />
                </div>
              </div>
              <p className="text-[11px] font-serif tracking-widest text-slate-700 uppercase mt-1">
                KERALA DESAM • MALAYALAM DAILY NEWSPAPER
              </p>
            </div>

            {/* Page Lead Content */}
            <div className="mt-4">
              <div className="border-b border-ink-midnight/30 pb-2 mb-3 flex items-center justify-between">
                <span className="bg-editorial-crimson text-white text-[10px] font-bold px-2 py-0.5 uppercase">
                  {currentPage === 1 ? 'ഒന്നാം പേജ് • പ്രധാന വാർത്തകൾ' : `പേജ് ${currentPage} • പ്രത്യേക പതിപ്പ്`}
                </span>
                <span className="text-[11px] font-serif italic text-slate-600">
                  Daily BroadSheet Edition
                </span>
              </div>

              {/* Newspaper Columns Simulation */}
              <div className="space-y-4">
                <h1 className="font-headline text-2xl sm:text-3xl font-black text-ink-midnight leading-tight tracking-tight">
                  വയനാട് ഇരട്ട തുരങ്കപാത നിർമാണത്തിന് കേന്ദ്ര പരിസ്ഥിതി അനുമതി; മലയോര ഹൈവേ വികസനത്തിൽ നിർണായക വഴിത്തിരിവ്
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-2">
                  <div className="md:col-span-8">
                    <img
                      src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80"
                      alt="News Front"
                      className="w-full h-56 object-cover rounded-xs border border-slate-300 mb-2"
                    />
                    <p className="text-[11px] text-slate-500 italic mb-3">
                      നിർദ്ദിഷ്ട വയനാട് തുരങ്കപാതയുടെ ആനക്കാംപൊയിൽ പ്രവേശന കവാടം സ്ഥിതി ചെയ്യുന്ന മലനിരകൾ.
                    </p>
                    <div className="columns-2 gap-4 text-xs leading-relaxed text-justify text-slate-800 font-serif">
                      <p className="mb-2">
                        കോഴിക്കോട് ജില്ലയിലെ ആനക്കാംപൊയിലിനെയും വയനാട് ജില്ലയിലെ മേപ്പാടിയെയും ബന്ധിപ്പിച്ച് നിർമിക്കുന്ന ചരിത്രപ്രസിദ്ധമായ ഇരട്ട തുരങ്കപാത നിർമാണത്തിന് കേന്ദ്ര വനം പരിസ്ഥിതി മന്ത്രാലയത്തിന്റെ അന്തിമ അനുമതി ലഭിച്ചു.
                      </p>
                      <p className="mb-2">
                        2,134 കോടി രൂപ കിഫ്ബി വഴി വകയിരുത്തിയിട്ടുള്ള ഈ മെഗാ പ്രൊജക്റ്റിൽ രണ്ട് തുരങ്കങ്ങളിലായി ആകെ നാല് വരി പാതയാണ് വിഭാവനം ചെയ്തിരിക്കുന്നത്. നിർമാണ കരാർ ഉടൻ തന്നെ ഗ്ലോബൽ ടെൻഡറിലൂടെ അന്തിമമാക്കുമെന്ന് മുഖ്യമന്ത്രിയുടെ ഓഫീസ് വ്യക്തമാക്കി.
                      </p>
                    </div>
                  </div>

                  <div className="md:col-span-4 bg-slate-50 p-3 rounded border border-slate-200 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-editorial-crimson block mb-1">
                        സംഗ്രഹം
                      </span>
                      <h4 className="font-headline text-sm font-bold text-ink-midnight mb-2">
                        പദ്ധതിയുടെ പ്രധാന സവിശേഷതകൾ:
                      </h4>
                      <ul className="text-xs space-y-1.5 list-disc list-inside text-slate-700 font-serif">
                        <li>8.11 കിലോമീറ്റർ നീളമുള്ള ഇരട്ട തുരങ്കം.</li>
                        <li>യാത്രാസമയം ഒന്നര മണിക്കൂർ ലാഭിക്കാം.</li>
                        <li>കൊങ്കൺ റെയിൽവേ മേൽനോട്ടം വഹിക്കും.</li>
                      </ul>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-300 text-center bg-white p-2 border">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">
                        വാണിജ്യ പരസ്യം
                      </span>
                      <p className="text-xs font-bold text-primary mt-1">
                        കേരള ബാങ്ക് ഭവന വായ്പകൾക്ക് പലിശ ഇളവ്
                      </p>
                      <span className="text-[10px] text-slate-600">
                        വിവരങ്ങൾക്ക് അടുത്തുള്ള ശാഖ സന്ദർശിക്കുക
                      </span>
                    </div>
                  </div>
                </div>
              </div>
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
