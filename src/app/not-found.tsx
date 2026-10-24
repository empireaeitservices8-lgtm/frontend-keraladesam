import React from 'react';
import Link from 'next/link';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-parchment-base">
      <div className="max-w-md w-full text-center bg-surface-pure rounded-xl p-8 shadow-sm border border-slate-border">
        <span className="inline-block text-5xl font-black text-primary font-headline mb-3">
          404
        </span>
        <h1 className="text-xl font-bold text-ink-midnight mb-2 font-headline">
          പേജ് കണ്ടെത്താനായില്ല
        </h1>
        <p className="text-xs text-secondary mb-6 leading-relaxed">
          നിങ്ങൾ തിരയുന്ന വാർത്തയോ പേജോ നീക്കം ചെയ്യപ്പെടുകയോ വിലാസത്തിൽ മാറ്റം വരികയോ ചെയ്തിട്ടുണ്ടാകാം.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-editorial-crimson transition-colors shadow-sm"
          >
            <Home className="w-4 h-4" />
            <span>പ്രധാന പേജിലേക്ക് മടങ്ങുക</span>
          </Link>
          <Link
            href="/search"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-colors border border-slate-border"
          >
            <Search className="w-4 h-4" />
            <span>വാർത്തകൾ തിരയുക</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
