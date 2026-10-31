'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Megaphone,
  ArrowLeft,
  CheckCircle2,
  Phone,
  Mail,
  Send,
  Sparkles,
  TrendingUp,
  Globe2,
  Users,
  Tv,
  Newspaper,
  Layout,
  FileText,
  BadgeCheck,
  Check,
  MessageCircle,
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { submitAdInquiry } from '@/lib/api';

const AD_PACKAGES = [
  {
    id: 'web-banner',
    title: 'ഡിജിറ്റൽ വെബ് ബാനറുകൾ',
    subtitle: 'Digital Web Banners',
    badge: 'ഏറ്റവും കൂടുതൽ ക്ലിക്കുകൾ',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    icon: Layout,
    description: 'കേരളദേശം വെബ്‌സൈറ്റിലെ ഹോം പേജിലും വാർത്താ പേജുകളിലും ഹൈ-ഇംപാക്റ്റ് ബാനറുകൾ.',
    features: [
      'ടോപ്പ് ഹെഡർ ലീഡർബോർഡ് (970x90 / 728x90)',
      'വാർത്തകൾക്കുള്ളിലെ പ്രൊമിനന്റ് ഇൻ-ആർട്ടിക്കിൾ ബാനറുകൾ (300x250)',
      'മൊബൈൽ സ്റ്റിക്ക് ബാനർ (320x50)',
      'തത്സമയ ക്ലിക്ക് & ഇംപ്രഷൻ അനലിറ്റിക്സ്',
    ],
    pricing: '₹1,500 / ദിവസം മുതൽ',
    recommendedFor: 'ഇ-കൊമേഴ്‌സ്, റീട്ടെയിൽ, ജ്വല്ലറി, റിയൽ എസ്റ്റേറ്റ്, വിദ്യാഭ്യാസ സ്ഥാപനങ്ങൾ',
  },
  {
    id: 'sponsored-article',
    title: 'സ്പോൺസേർഡ് ആർട്ടിക്കിൾ & PR',
    subtitle: 'Sponsored Story & Brand PR',
    badge: 'ബ്രാൻഡ് വിശ്വാസ്യത',
    badgeColor: 'bg-editorial-crimson/10 text-editorial-crimson border-editorial-crimson/20',
    icon: FileText,
    description: 'നിങ്ങളുടെ സംരംഭത്തിന്റെ കഥ, പുതിയ ലോഞ്ചുകൾ, ഇന്റർവ്യൂ എന്നിവ വാർത്താ രൂപത്തിൽ പ്രസിദ്ധീകരിക്കാം.',
    features: [
      'പൂർണ്ണ ലേഖനം, ഹൈ-റെസലൂഷൻ ഫോട്ടോകൾ, വീഡിയോ ലിങ്ക്',
      'നിങ്ങളുടെ വെബ്‌സൈറ്റിലേക്ക് നേരിട്ടുള്ള ഡയറക്ട് ലിങ്ക്',
      'ഫെയ്‌സ്ബുക്ക്, ഇൻസ്റ്റാഗ്രാം, വാട്സാപ്പ് ചാനൽ വഴി പ്രത്യേക പബ്ലിസിറ്റി',
      'ഗൂഗിൾ സെർച്ചിൽ ശാശ്വതമായി ലഭ്യമാകുന്ന ആർട്ടിക്കിൾ',
    ],
    pricing: '₹3,500 / ആർട്ടിക്കിൾ മുതൽ',
    recommendedFor: 'പുതിയ ബ്രാൻഡുകൾ, ആശുപത്രികൾ, സ്റ്റാർട്ടപ്പുകൾ, പ്രവാസി സംരംഭങ്ങൾ',
  },
  {
    id: 'video-live',
    title: 'വീഡിയോ & ലൈവ് ടിവി പരസ്യങ്ങൾ',
    subtitle: 'Video & Digital TV Ads',
    badge: 'ഹൈ എൻഗേജ്‌മെന്റ്',
    badgeColor: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
    icon: Tv,
    description: 'കേരളദേശം 24x7 ലൈവ് സ്ട്രീമിലും യൂട്യൂബ് ചാനലിലും പ്രീമിയം വീഡിയോ സ്ലോട്ടുകൾ.',
    features: [
      '10-30 സെക്കൻഡ് വീഡിയോ ബമ്പർ പരസ്യങ്ങൾ',
      'ലൈവ് ടിവി സ്ക്രോൾ പരസ്യങ്ങൾ (Ticker Scroll Ads)',
      'പ്രധാന ചർച്ചാ പരിപാടികൾക്കും സ്പെഷ്യൽ ബുള്ളറ്റിനുകൾക്കും സ്പോൺസർഷിപ്പ്',
      'സോഷ്യൽ മീഡിയ റീൽസ് / ഷോർട്സ് കൊളാബറേഷൻ',
    ],
    pricing: '₹5,000 / കാമ്പയിൻ മുതൽ',
    recommendedFor: 'ഓട്ടോമൊബൈൽ, വൻകിട ബ്രാൻഡുകൾ, ഇവന്റുകൾ, സിനിമ പ്രൊമോഷൻ',
  },
  {
    id: 'epaper-print',
    title: 'ഇ-പേപ്പർ പതിപ്പ് പരസ്യങ്ങൾ',
    subtitle: 'E-Paper & Print Display',
    badge: 'ക്ലാസിക് വായനക്കാർ',
    badgeColor: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
    icon: Newspaper,
    description: 'കേരളദേശം ഇ-പേപ്പർ പതിപ്പിലെ ഫുൾ പേജ്, ഹാഫ് പേജ്, ക്ലാസിഫൈഡ് പരസ്യങ്ങൾ.',
    features: [
      'ഫുൾ പേജ്, ഹാഫ് പേജ്, ക്വാർട്ടർ പേജ് ഡിസ്‌പ്ലേ',
      'ക്ലാസിഫൈഡ് പരസ്യങ്ങൾ (മാട്രിമോണി, പ്രോപ്പർട്ടി, ജോബ് വേക്കൻസി)',
      'ക്ലിക്ക് ചെയ്യാവുന്ന ഇന്ററാക്ടീവ് ഇ-പേപ്പർ ലിങ്കുകൾ',
      'ദിവസേന പതിനായിരക്കണക്കിന് പിഡിഎഫ് ഡൗൺലോഡുകൾ',
    ],
    pricing: '₹1,000 / പതിപ്പ് മുതൽ',
    recommendedFor: 'തദ്ദേശീയ ബിസിനസ്സുകൾ, ക്ലാസിഫൈഡ്സ്, ഗവൺമെന്റ് & കോർപ്പറേറ്റ് ടെൻഡറുകൾ',
  },
];

const AUDIENCE_STATS = [
  { label: 'പ്രതിമാസ വായനക്കാർ', value: '10 Lakhs+', desc: 'സജീവ ഓൺലൈൻ ഉപഭോക്താക്കൾ', icon: Users },
  { label: 'ആഗോള എൻ.ആർ.ഐ റീച്ച്', value: '65%+', desc: 'യു.എ.ഇ, ജി.സി.സി, യു.എസ്, യുകെ', icon: Globe2 },
  { label: 'ശരാശരി വായനാ സമയം', value: '3.8 മിനിറ്റ്', desc: 'ഉയർന്ന വായനാ ശ്രദ്ധ', icon: Clock },
  { label: 'സോഷ്യൽ മീഡിയ നെറ്റ്‌വർക്ക്', value: '5 Lakhs+', desc: 'വാട്സാപ്പ്, ഫെയ്‌സ്ബുക്ക്, യൂട്യൂബ്', icon: TrendingUp },
];

export default function AdRatesPage() {
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    phone: '',
    email: '',
    adType: 'ഡിജിറ്റൽ വെബ് ബാനറുകൾ (Digital Web Banners)',
    budget: '₹5,000 - ₹15,000',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      setErrorMessage('പേരും ഫോൺ നമ്പറും നൽകേണ്ടതാണ്.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');
      const res = await submitAdInquiry({
        name: formData.name,
        companyName: formData.companyName,
        phone: formData.phone,
        email: formData.email,
        adType: formData.adType,
        budget: formData.budget,
        message: formData.message,
      });

      if (res.success) {
        setSubmitted(true);
      } else {
        setErrorMessage(res.error || 'പരസ്യ അപേക്ഷ അയക്കാൻ കഴിഞ്ഞില്ല. വീണ്ടും ശ്രമിക്കുക.');
      }
    } catch {
      setErrorMessage('നെറ്റ്‌വർക്ക് തകരാർ. ദയവായി അല്പം കഴിഞ്ഞ് ശ്രമിക്കുക അല്ലെങ്കിൽ വാട്സാപ്പിൽ ബന്ധപ്പെടുക.');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppInquiry = () => {
    const text = encodeURIComponent(
      `നമസ്കാരം കേരളദേശം അഡ്വർടൈസിംഗ് ടീം,\n\nഞാൻ കേരളദേശത്തിൽ പരസ്യം നൽകാൻ ആഗ്രഹിക്കുന്നു.\nപേര്: ${formData.name || 'അഡ്വർടൈസർ'}\nസ്ഥാപനം: ${formData.companyName || 'സൂചിപ്പിച്ചിട്ടില്ല'}\nആവശ്യമായ പരസ്യം: ${formData.adType}\nബജറ്റ്: ${formData.budget}\nവിവരങ്ങൾ അറിയിക്കുമല്ലോ.`
    );
    window.open(`https://api.whatsapp.com/send?phone=919387478887&text=${text}`, '_blank');
  };

  return (
    <div className="flex flex-col w-full pb-20 bg-[#fbfbfb]">
      {/* Top Breadcrumb & Header Banner */}
      <section className="w-full bg-ink-midnight text-white py-12 px-4 md:px-margin-desktop border-b border-slate-border">
        <div className="max-w-[1360px] mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-white/70 mb-4 uppercase tracking-wider font-semibold">
            <Link href="/" className="hover:underline font-bold text-sm sm:text-base text-white">
              HOME
            </Link>
            <span className="text-white/40">/</span>
            <span className="font-bold text-opinion-ochre">AD RATES (പരസ്യ നിരക്കുകൾ)</span>
          </div>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-editorial-crimson/30 border border-editorial-crimson/50 text-white text-xs font-bold uppercase tracking-wider mb-3">
              <Megaphone className="w-3.5 h-3.5 text-editorial-crimson" />
              <span>ഔദ്യോഗിക പരസ്യ നിരക്കുകളും മീഡിയ കിറ്റും</span>
            </div>
            <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
              കേരളദേശം വഴി ലോകമെമ്പാടുമുള്ള ദശലക്ഷങ്ങളിലേക്ക് നിങ്ങളുടെ ബ്രാൻഡ് എത്തിക്കൂ
            </h1>
            <p className="text-sm sm:text-base text-surface-pure/80 leading-relaxed">
              വിശ്വസനീയമായ വാർത്താ മാധ്യമത്തിലൂടെ നിങ്ങളുടെ ബിസിനസ്സ്, ബ്രാൻഡ്, പുതിയ ഉൽപ്പന്നങ്ങൾ എന്നിവ കേരളത്തിലും
              ഗൾഫ് രാജ്യങ്ങളിലുമുള്ള ലക്ഷക്കണക്കിന് ഉപഭോക്താക്കളിലേക്ക് വളർത്താം.
            </p>
          </div>
        </div>
      </section>

      {/* Audience Statistics Ribbon */}
      <section className="w-full -mt-6 max-w-[1360px] mx-auto px-4 md:px-margin-desktop">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 bg-surface-pure rounded-xl p-4 sm:p-6 shadow-md border border-slate-border">
          {AUDIENCE_STATS.map((stat, idx) => (
            <div key={idx} className="flex items-center gap-3.5 p-2">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 text-editorial-crimson ring-1 ring-slate-200">
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-black text-ink-midnight block leading-tight font-headline">
                  {stat.value}
                </span>
                <span className="text-xs font-bold text-slate-800 block">
                  {stat.label}
                </span>
                <span className="text-[11px] text-slate-500 hidden sm:block">
                  {stat.desc}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Main Content: Ad Packages + Booking Form */}
      <div className="max-w-[1360px] mx-auto px-4 md:px-margin-desktop mt-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Tariff Cards (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="font-headline text-2xl font-bold text-ink-midnight">
                പരസ്യ വിഭാഗങ്ങളും നിരക്കുകളും (Advertising Options)
              </h2>
              <p className="text-xs sm:text-sm text-secondary mt-1">
                നിങ്ങളുടെ ലക്ഷ്യത്തിനും ബജറ്റിനും അനുയോജ്യമായ പരസ്യ പാക്കേജ് തിരഞ്ഞെടുക്കൂ.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {AD_PACKAGES.map((pkg) => {
                const IconComponent = pkg.icon;
                return (
                  <div
                    key={pkg.id}
                    className="flex flex-col justify-between p-5 rounded-xl bg-surface-pure border border-slate-border shadow-xs hover:shadow-md transition-shadow group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="p-2.5 rounded-lg bg-slate-100 text-editorial-crimson group-hover:bg-editorial-crimson group-hover:text-white transition-colors">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${pkg.badgeColor}`}>
                          {pkg.badge}
                        </span>
                      </div>

                      <h3 className="font-headline text-base font-bold text-ink-midnight leading-tight">
                        {pkg.title}
                      </h3>
                      <span className="text-[11px] text-slate-400 block mb-2 font-medium">
                        {pkg.subtitle}
                      </span>

                      <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                        {pkg.description}
                      </p>

                      <ul className="space-y-1.5 mb-4 text-xs text-slate-700">
                        {pkg.features.map((feat, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="leading-tight">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-3 border-t border-slate-100">
                      <div className="flex items-baseline justify-between mb-2">
                        <span className="text-[11px] text-slate-500 font-medium">നിരക്ക്:</span>
                        <span className="text-sm font-black text-editorial-crimson font-headline">
                          {pkg.pricing}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block line-clamp-1">
                        അനുയോജ്യം: {pkg.recommendedFor}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Direct Contact Hotline Strip */}
            <div className="p-5 rounded-xl bg-gradient-to-r from-slate-900 to-ink-midnight text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
              <div>
                <span className="text-xs font-bold text-opinion-ochre uppercase tracking-wider block mb-1">
                  നേരിട്ട് സംസാരിക്കാൻ ആഗ്രഹിക്കുന്നുവോ?
                </span>
                <h4 className="text-base font-bold">കേരളദേശം അഡ്വർടൈസിംഗ് ഡെസ്ക്</h4>
                <p className="text-xs text-white/70">തിങ്കൾ മുതൽ ശനി വരെ (9:30 AM - 6:30 PM)</p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <a
                  href="tel:+919387478887"
                  className="px-3.5 py-2 rounded-lg bg-editorial-crimson hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow"
                >
                  <Phone className="w-3.5 h-3.5" /> +91 9387478887
                </a>
                <a
                  href="tel:+919847053700"
                  className="px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition border border-white/20"
                >
                  <Phone className="w-3.5 h-3.5" /> +91 9847053700
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Inquiry / Booking Form (5 cols) */}
          <div className="lg:col-span-5 sticky top-24">
            <div className="bg-surface-pure rounded-2xl p-6 shadow-lg border border-slate-border">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="p-2 rounded-lg bg-editorial-crimson/10 text-editorial-crimson">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-headline text-lg font-bold text-ink-midnight">
                    പരസ്യ വിവരങ്ങൾ ചോദിച്ചറിയൂ
                  </h3>
                  <span className="text-xs text-slate-500">
                    നിങ്ങളുടെ ആവശ്യങ്ങൾ സമർപ്പിക്കൂ, ഞങ്ങൾ ഉടൻ ബന്ധപ്പെടും
                  </span>
                </div>
              </div>

              {submitted ? (
                <div className="py-8 text-center flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                    <Check className="w-7 h-7" />
                  </div>
                  <h4 className="text-lg font-bold text-ink-midnight mb-2">
                    അപേക്ഷ വിജയകരമായി ലഭിച്ചു!
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-sm mb-6">
                    താങ്കളുടെ പരസ്യ വിവരങ്ങൾ ഞങ്ങളുടെ മാർക്കറ്റിംഗ് ടീമിന് കൈമാറി. ഉടൻ തന്നെ ഫോൺ വഴിയോ ഇമെയിൽ വഴിയോ ബന്ധപ്പെടുന്നതാണ്.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: '',
                        companyName: '',
                        phone: '',
                        email: '',
                        adType: 'ഡിജിറ്റൽ വെബ് ബാനറുകൾ (Digital Web Banners)',
                        budget: '₹5,000 - ₹15,000',
                        message: '',
                      });
                    }}
                    className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
                  >
                    മറ്റൊരു അന്വേഷണം സമർപ്പിക്കുക
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  {errorMessage && (
                    <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                      {errorMessage}
                    </div>
                  )}

                  {/* Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      നിങ്ങളുടെ പേര് (Full Name) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="ഉദാ: രാഹുൽ മേനോൻ"
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-editorial-crimson/20 focus:border-editorial-crimson"
                    />
                  </div>

                  {/* Company Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      സ്ഥാപനം / ബ്രാൻഡ് (Business / Brand Name)
                    </label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      placeholder="ഉദാ: ABC Builders & Developers"
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-editorial-crimson/20 focus:border-editorial-crimson"
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ഫോൺ നമ്പർ / വാട്സാപ്പ് (Phone Number) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 9876543210"
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-editorial-crimson/20 focus:border-editorial-crimson"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ഇമെയിൽ വിലാസം (Email Address)
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="business@example.com"
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-editorial-crimson/20 focus:border-editorial-crimson"
                    />
                  </div>

                  {/* Ad Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        ആവശ്യമായ പരസ്യം
                      </label>
                      <select
                        value={formData.adType}
                        onChange={(e) => setFormData({ ...formData, adType: e.target.value })}
                        className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-editorial-crimson bg-white"
                      >
                        <option value="ഡിജിറ്റൽ വെബ് ബാനറുകൾ (Digital Web Banners)">ഡിജിറ്റൽ വെബ് ബാനറുകൾ</option>
                        <option value="സ്പോൺസേർഡ് ആർട്ടിക്കിൾ & PR">സ്പോൺസേർഡ് ആർട്ടിക്കിൾ & PR</option>
                        <option value="വീഡിയോ & ലൈവ് ടിവി പരസ്യങ്ങൾ">വീഡിയോ & ലൈവ് ടിവി</option>
                        <option value="ഇ-പേപ്പർ പതിപ്പ് പരസ്യങ്ങൾ">ഇ-പേപ്പർ പതിപ്പ്</option>
                        <option value="മറ്റുള്ളവ / സംയോജിത പാക്കേജ്">മറ്റുള്ളവ / കോംബോ</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        ഉദ്ദേശിക്കുന്ന ബജറ്റ്
                      </label>
                      <select
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-editorial-crimson bg-white"
                      >
                        <option value="₹2,000 - ₹5,000">₹2,000 - ₹5,000</option>
                        <option value="₹5,000 - ₹15,000">₹5,000 - ₹15,000</option>
                        <option value="₹15,000 - ₹50,000">₹15,000 - ₹50,000</option>
                        <option value="₹50,000+ (മാസിക/വാർഷിക പാക്കേജ്)">₹50,000+ (മാസിക)</option>
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      കൂടുതൽ വിവരങ്ങൾ (Details / Message)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="നിങ്ങളുടെ ആവശ്യങ്ങളോ പരസ്യം ചെയ്യേണ്ട തീയതികളോ ഇവിടെ കുറിക്കാം..."
                      className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:border-editorial-crimson resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-editorial-crimson hover:bg-primary disabled:opacity-60 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition shadow-md"
                  >
                    {loading ? (
                      <span>അയക്കുന്നു...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>അപേക്ഷ സമർപ്പിക്കുക (Submit Inquiry)</span>
                      </>
                    )}
                  </button>

                  {/* WhatsApp Direct Option */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleWhatsAppInquiry}
                      className="w-full py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-xs"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>വാട്സാപ്പ് വഴി നേരിട്ട് ചോദിച്ചറിയൂ</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
