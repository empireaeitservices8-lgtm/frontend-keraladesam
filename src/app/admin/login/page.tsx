'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Mail,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  AlertCircle,
  Loader2,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, loading } = useAdminAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If already logged in, redirect to admin console
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/admin');
    }
  }, [isAuthenticated, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!email.trim() || !password) {
      setErrorMsg('ദയവായി ഇമെയിലും പാസ്‌വേഡും നൽകുക.');
      return;
    }

    setSubmitting(true);
    const res = await login(email.trim(), password);
    setSubmitting(false);

    if (res.success) {
      router.push('/admin');
    } else {
      setErrorMsg(res.error || 'ലോഗിൻ പരാജയപ്പെട്ടു. ഇമെയിലും പാസ്‌വേഡും പരിശോധിക്കുക.');
    }
  };

  const fillDemoAdmin = () => {
    setEmail('admin@keraladesam.com');
    setPassword('admin12345');
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-ink-midnight to-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 text-white relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-editorial-crimson/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand & Back navigation */}
      <div className="w-full max-w-md flex items-center justify-between mb-6 z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>വാർത്താ പോർട്ടലിലേക്ക് മടങ്ങുക</span>
        </Link>
        <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
          ● എഡിറ്റോറിയൽ സുരക്ഷിതം
        </span>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-white/15 rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-editorial-crimson/20 border border-editorial-crimson/30 text-editorial-crimson mb-3">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="font-headline text-2xl font-bold tracking-tight text-white mb-1">
            എഡിറ്റോറിയൽ ലോഗിൻ
          </h1>
          <p className="text-xs text-slate-400">
            കേരളദേശം എഡിറ്റർ & അഡ്മിൻ കൺസോൾ
          </p>
        </div>

        {/* Demo Quick Fill Helper */}
        <div className="mb-6 p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-300 block font-medium">ഡെമോ അഡ്മിൻ അക്കൗണ്ട്:</span>
            <span className="text-[11px] text-slate-400 font-mono">admin@keraladesam.com</span>
          </div>
          <button
            type="button"
            onClick={fillDemoAdmin}
            className="px-2.5 py-1 rounded bg-editorial-crimson hover:bg-red-700 text-white text-[11px] font-bold transition-colors flex items-center gap-1 shadow-sm"
          >
            <Sparkles className="w-3 h-3" />
            ഉപയോഗിക്കുക
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-5 p-3 rounded-lg bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              ഔദ്യോഗിക ഇമെയിൽ വിലാസം (Email)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="editor@keraladesam.com"
                className="w-full bg-slate-950/80 border border-white/15 rounded-lg py-2.5 pl-10 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-editorial-crimson focus:border-editorial-crimson transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              രഹസ്യ പാസ്‌വേഡ് (Password)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950/80 border border-white/15 rounded-lg py-2.5 pl-10 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-editorial-crimson focus:border-editorial-crimson transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 px-4 rounded-lg bg-editorial-crimson hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-lg shadow-editorial-crimson/25 flex items-center justify-center gap-2 mt-6"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>പരിശോധിക്കുന്നു...</span>
              </>
            ) : (
              <>
                <span>പ്രവേശിക്കുക (Login)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer info & Register link */}
        <div className="mt-6 pt-5 border-t border-white/10 text-center text-xs text-slate-400">
          <span>പുതിയ എഡിറ്റർ ആണോ? </span>
          <Link
            href="/admin/register"
            className="text-primary hover:text-red-400 font-bold transition-colors ml-1 underline underline-offset-2"
          >
            പുതിയ അക്കൗണ്ട് രജിസ്റ്റർ ചെയ്യുക →
          </Link>
        </div>
      </div>
    </div>
  );
}
