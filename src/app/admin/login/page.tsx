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
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  LogOut,
  CheckCircle2
} from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, logout, user, isAuthenticated, loading } = useAdminAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  // Validation function
  const validateForm = () => {
    const errors: { email?: string; password?: string } = {};
    const emailTrimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailTrimmed) {
      errors.email = 'ഇമെയിൽ വിലാസം നിർബന്ധമാണ് (Email is required).';
    } else if (!emailRegex.test(emailTrimmed)) {
      errors.email = 'ശരിയായ ഇമെയിൽ വിലാസം നൽകുക (Invalid email format).';
    }

    if (!password) {
      errors.password = 'രഹസ്യ പാസ്‌വേഡ് നിർബന്ധമാണ് (Password is required).';
    } else if (password.length < 6) {
      errors.password = 'പാസ്‌വേഡ് കുറഞ്ഞത് 6 അക്ഷരങ്ങൾ ഉണ്ടായിരിക്കണം (Minimum 6 characters).';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (fieldErrors.email) {
      setFieldErrors((prev) => ({ ...prev, email: undefined }));
    }
    if (errorMsg) setErrorMsg(null);
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (fieldErrors.password) {
      setFieldErrors((prev) => ({ ...prev, password: undefined }));
    }
    if (errorMsg) setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Strict client-side validation
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    const res = await login(email.trim(), password);
    setSubmitting(false);

    if (res.success) {
      // Only navigate to admin after confirmed successful authentication
      router.replace('/admin');
    } else {
      setErrorMsg(
        res.error === 'Invalid email or password'
          ? 'നൽകിയ ഇമെയിലോ പാസ്‌വേഡോ തെറ്റാണ്. ദയവായി ശരിയായ വിവരങ്ങൾ നൽകി ലോഗിൻ ചെയ്യുക.'
          : res.error || 'ലോഗിൻ പരാജയപ്പെട്ടു. വിവരങ്ങൾ വീണ്ടും പരിശോധിക്കുക.'
      );
    }
  };

  const handleLogoutExisting = () => {
    logout();
    setEmail('');
    setPassword('');
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-ink-midnight to-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 text-white relative overflow-hidden">
      {/* Background glow accents */}
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
      <div className="w-full max-w-md bg-slate-900/95 backdrop-blur-xl border border-white/15 rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10">
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

        {/* If user is already logged in, show status & option to proceed or logout */}
        {!loading && isAuthenticated && user && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-xs text-emerald-200">
            <div className="flex items-center gap-2 font-bold text-white mb-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>നിലവിൽ ലോഗിൻ ചെയ്തിരിക്കുന്നു</span>
            </div>
            <p className="text-slate-300 text-[11px] mb-3">
              ലോഗിൻ ചെയ്ത അക്കൗണ്ട്: <strong className="text-white">{user.email}</strong> ({user.name})
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => router.replace('/admin')}
                className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow"
              >
                <span>അഡ്മിൻ പാനലിലേക്ക് പോകുക</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleLogoutExisting}
                className="py-2 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white font-medium text-xs transition flex items-center gap-1"
                title="മറ്റൊരു അക്കൗണ്ടിൽ കയറാൻ ലോഗ് ഔട്ട് ചെയ്യുക"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>ലോഗ് ഔട്ട്</span>
              </button>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-5 p-3 rounded-lg bg-red-950/90 border border-red-500/60 text-red-200 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              ഔദ്യോഗിക ഇമെയിൽ വിലാസം (Email) <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
              <input
                type="email"
                value={email ?? ''}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="editor@keraladesam.com"
                className={`w-full bg-slate-950/80 rounded-lg py-2.5 pl-10 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none transition-all ${
                  fieldErrors.email
                    ? 'border-2 border-red-500 focus:ring-1 focus:ring-red-500'
                    : 'border border-white/15 focus:ring-2 focus:ring-editorial-crimson focus:border-editorial-crimson'
                }`}
              />
            </div>
            {fieldErrors.email && (
              <p className="mt-1 text-[11px] text-red-400 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              രഹസ്യ പാസ്‌വേഡ് (Password) <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password ?? ''}
                onChange={(e) => handlePasswordChange(e.target.value)}
                placeholder="കുറഞ്ഞത് 6 അക്ഷരങ്ങൾ"
                className={`w-full bg-slate-950/80 rounded-lg py-2.5 pl-10 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none transition-all ${
                  fieldErrors.password
                    ? 'border-2 border-red-500 focus:ring-1 focus:ring-red-500'
                    : 'border border-white/15 focus:ring-2 focus:ring-editorial-crimson focus:border-editorial-crimson'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white transition-colors p-0.5"
                title={showPassword ? 'പാസ്‌വേഡ് മറയ്ക്കുക' : 'പാസ്‌വേഡ് കാണുക'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="mt-1 text-[11px] text-red-400 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {fieldErrors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 px-4 rounded-lg bg-editorial-crimson hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-lg shadow-editorial-crimson/25 flex items-center justify-center gap-2 mt-6 active:scale-[0.99]"
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
