'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Next.js Page Error caught:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16 bg-parchment-base">
      <div className="max-w-md w-full text-center bg-surface-pure rounded-xl p-8 shadow-sm border border-slate-border">
        <div className="w-12 h-12 rounded-full bg-red-100 text-editorial-crimson flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-ink-midnight mb-2 font-headline">
          പ്രവർത്തനത്തിൽ തടസ്സം നേരിട്ടു
        </h2>
        <p className="text-xs text-secondary mb-6 leading-relaxed">
          വിവരങ്ങൾ ലഭ്യമാക്കുന്നതിൽ താൽക്കാലിക തടസ്സം നേരിട്ടു. ദയവായി പേജ് വീണ്ടും റീലോഡ് ചെയ്യുക.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-editorial-crimson transition-colors shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>വീണ്ടും ശ്രമിക്കുക</span>
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-colors border border-slate-border"
          >
            <Home className="w-4 h-4" />
            <span>പ്രധാന പേജ്</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
