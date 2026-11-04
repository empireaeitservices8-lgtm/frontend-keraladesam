'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  UserPlus,
  Mail,
  Lock,
  User,
  Shield,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';

export default function AdminRegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated, loading } = useAdminAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'editor' | 'admin'>('editor');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/admin');
    }
  }, [isAuthenticated, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!name.trim() || !email.trim() || !password) {
      setErrorMsg('എല്ലാ ഫീൽഡുകളും പൂരിപ്പിക്കേണ്ടതുണ്ട്.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('പാസ്‌വേഡ് കുറഞ്ഞത് 6 അക്ഷരങ്ങൾ ഉണ്ടായിരിക്കണം.');
      return;
    }

    setSubmitting(true);
    const res = await register(name.trim(), email.trim(), password, role);
    setSubmitting(false);

    if (res.success) {
      setSuccessMsg('അക്കൗണ്ട് വിജയകരമായി സൃഷ്ടിച്ചു! അഡ്മിൻ കൺസോളിലേക്ക് മാറുന്നു...');
      setTimeout(() => {
        router.push('/admin');
      }, 1200);
    } else {
      setErrorMsg(res.error || 'രജിസ്ട്രേഷൻ പരാജയപ്പെട്ടു. മറ്റൊരു ഇമെയിൽ ഉപയോഗിച്ച് ശ്രമിക്കുക.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-ink-midnight to-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 text-white relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-editorial-crimson/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navigation */}
      <div className="w-full max-w-md flex items-center justify-between mb-6 z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>പോർട്ടലിലേക്ക് മടങ്ങുക</span>
        </Link>
        <span className="text-[11px] font-mono uppercase tracking-widest text-opinion-ochre bg-amber-950/70 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
          ● എഡിറ്റോറിയൽ രജിസ്ട്രേഷൻ
        </span>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-white/15 rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-primary/20 border border-primary/30 text-primary mb-3">
            <UserPlus className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="font-headline text-2xl font-bold tracking-tight text-white mb-1">
            എഡിറ്റർ രജിസ്ട്രേഷൻ
          </h1>
          <p className="text-xs text-slate-400">
            പുതിയ എഡിറ്റോറിയൽ അംഗങ്ങൾക്ക് പ്രവേശനം നൽകുക
          </p>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              പൂർണ്ണ നാമം (Full Name)
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
              <input
                type="text"
                required
                value={name ?? ''}
                onChange={(e) => setName(e.target.value)}
                placeholder="ഉദാ: ആനന്ദ് നായർ"
                className="w-full bg-slate-950/80 border border-white/15 rounded-lg py-2.5 pl-10 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              ഔദ്യോഗിക ഇമെയിൽ വിലാസം (Email)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
              <input
                type="email"
                required
                value={email ?? ''}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="anand@keraladesam.com"
                className="w-full bg-slate-950/80 border border-white/15 rounded-lg py-2.5 pl-10 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              രഹസ്യ പാസ്‌വേഡ് (Password - Min 6 chars)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
              <input
                type="password"
                required
                minLength={6}
                value={password ?? ''}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950/80 border border-white/15 rounded-lg py-2.5 pl-10 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              എഡിറ്റോറിയൽ പദവി (Role)
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setRole('editor')}
                className={`py-2 px-3 rounded-lg border text-center font-medium transition-all ${
                  role === 'editor'
                    ? 'bg-blue-600/30 border-blue-500 text-blue-200 font-bold'
                    : 'bg-slate-950/60 border-white/10 text-slate-400 hover:bg-white/5'
                }`}
              >
                📰 സ്റ്റാഫ് എഡിറ്റർ
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`py-2 px-3 rounded-lg border text-center font-medium transition-all ${
                  role === 'admin'
                    ? 'bg-red-600/30 border-red-500 text-red-200 font-bold'
                    : 'bg-slate-950/60 border-white/10 text-slate-400 hover:bg-white/5'
                }`}
              >
                🛡️ ചീഫ് അഡ്മിൻ
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 px-4 rounded-lg bg-primary hover:bg-blue-600 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 mt-6"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>രജിസ്റ്റർ ചെയ്യുന്നു...</span>
              </>
            ) : (
              <>
                <span>അക്കൗണ്ട് സൃഷ്ടിക്കുക (Register)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer info & Login link */}
        <div className="mt-6 pt-5 border-t border-white/10 text-center text-xs text-slate-400">
          <span>ഇതിനകം അക്കൗണ്ട് ഉണ്ടോ? </span>
          <Link
            href="/admin/login"
            className="text-editorial-crimson hover:text-red-400 font-bold transition-colors ml-1 underline underline-offset-2"
          >
            നേരിട്ട് ലോഗിൻ ചെയ്യുക →
          </Link>
        </div>
      </div>
    </div>
  );
}
