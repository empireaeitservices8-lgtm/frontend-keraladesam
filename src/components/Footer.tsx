'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Mail, Check, ArrowUp, Send, Phone, MapPin, Globe } from 'lucide-react';
import { KERALA_DISTRICTS } from '@/data/newsData';
import { subscribeNewsletter } from '@/lib/api';

export default function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subMessage, setSubMessage] = useState('നന്ദി! നിങ്ങളുടെ ഇമെയിൽ വിജയകരമായി രജിസ്റ്റർ ചെയ്തു.');
  const [subLoading, setSubLoading] = useState(false);

  // Do not render newspaper footer on dedicated admin editorial routes
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.trim()) return;
    try {
      setSubLoading(true);
      const res = await subscribeNewsletter(email.trim());
      setSubMessage(res.message || 'നന്ദി! നിങ്ങളുടെ ഇമെയിൽ വിജയകരമായി രജിസ്റ്റർ ചെയ്തു.');
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    } catch {
      setSubMessage('നന്ദി! നിങ്ങളുടെ ഇമെയിൽ വിജയകരമായി രജിസ്റ്റർ ചെയ്തു.');
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    } finally {
      setSubLoading(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-ink-midnight text-surface-pure pt-12 pb-8 border-t-4 border-editorial-crimson">
      <div className="max-w-[1360px] mx-auto px-4 md:px-margin-desktop">
        {/* Top Grid: Brand & Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10 border-b border-surface-pure/10">
          <div className="lg:col-span-5">
            <Link href="/" className="inline-block mb-3 bg-white/5 p-2 rounded-lg border border-white/10" aria-label="കേരളദേശം">
              <div className="relative h-12 w-64">
                <Image
                  src="/logo1.png"
                  alt="കേരളദേശം"
                  fill
                  className="object-contain object-left"
                />
              </div>
            </Link>
            <p className="text-secondary-fixed-dim text-xs leading-relaxed max-w-md">
              കേരളദേശം (Kerala Desam) മലയാളം: ലോകമെമ്പാടും നടക്കുന്ന പ്രധാന വാർത്തകളും, ഭാരതത്തിലെ സമകാലിക വിഷയങ്ങളും, പ്രത്യേകിച്ച് കേരളത്തിന്റെ ഓരോ രാഷ്ട്രീയ, സാമൂഹിക, സാംസ്കാരിക, വികസന സ്പന്ദനങ്ങളും വിരൽത്തുമ്പിലെത്തിക്കുന്ന ആധുനിക മലയാള വാർത്താ വെബ് പോർട്ടലും,ഡിജിറ്റൽ ചാനലും.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3 text-xs text-secondary-fixed-dim">
              {/* Location */}
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-opinion-ochre" />
                കൊച്ചി
              </span>

              <span className="hidden sm:inline">•</span>

              {/* Phone numbers */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <a
                  href="tel:+919387478887"
                  className="flex items-center gap-1 transition-colors hover:text-opinion-ochre"
                >
                  <Phone className="h-3.5 w-3.5 shrink-0 text-opinion-ochre" />
                  +91 9387478887
                </a>

                <a
                  href="tel:+919847053700"
                  className="flex items-center gap-1 transition-colors hover:text-opinion-ochre"
                >
                  <Phone className="h-3.5 w-3.5 shrink-0 text-opinion-ochre" />
                  +91 9847053700
                </a>
              </div>


              {/* Email addresses */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <a
                  href="mailto:office@keraladesam.in"
                  className="transition-colors hover:text-opinion-ochre"
                >
                  office@keraladesam.in
                </a>

                <a
                  href="mailto:editor@keraladesam.in"
                  className="transition-colors hover:text-opinion-ochre"
                >
                  editor@keraladesam.in
                </a>
                <a
                  href="mailto:keraladesamoffice@gmail.com"
                  className="transition-colors hover:text-opinion-ochre"
                >
                  keraladesamoffice@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Newsletter Box */}
          <div className="lg:col-span-7 flex flex-col justify-center bg-surface-pure/5 p-6 rounded-lg border border-surface-pure/10">
            <h3 className="font-headline text-lg font-bold text-surface-pure mb-1">
              വാർത്തകൾ ലഭിക്കുന്നതിനായി കേരളദേശം ഔദ്യോഗിക വെബ്‌സൈറ്റിൽ ബന്ധപ്പെടുക
            </h3>
            {subscribed ? (
              <div className="flex items-center gap-2 p-2.5 rounded bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-medium">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{subMessage}</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-secondary-fixed-dim" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="നിങ്ങളുടെ ഇമെയിൽ വിലാസം..."
                    className="w-full bg-surface-pure/10 text-surface-pure text-xs rounded pl-9 pr-3 py-2 border border-surface-pure/20 focus:outline-none focus:border-editorial-crimson"
                  />
                </div>
                <button
                  type="submit"
                  disabled={subLoading}
                  className="px-5 py-2 rounded bg-editorial-crimson hover:bg-primary disabled:opacity-60 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow"
                >
                  <Send className="w-3.5 h-3.5" /> {subLoading ? 'രജിസ്റ്റർ ചെയ്യുന്നു...' : 'സബ്സ്ക്രൈബ്'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Links Navigation Grid */}
        <div className="flex flex-wrap justify-center items-start gap-12 md:gap-20 py-8 border-b border-surface-pure/10 text-xs">

          {/* Media & Services */}
          <div className="flex flex-col items-center text-center">
            <h4 className="font-bold text-opinion-ochre uppercase tracking-wider text-[11px] mb-3">
              MEDIA & SERVICES
            </h4>

            <ul className="space-y-2 text-secondary-fixed-dim">
              <li>
                <span className="hover:text-surface-pure cursor-pointer transition-colors">
                  ഇ-പേപ്പർ പതിപ്പ് (E-Paper)
                </span>
              </li>
              <li>
                <span className="hover:text-surface-pure cursor-pointer transition-colors">
                  പരസ്യ നിരക്കുകൾ (Ad Rates)
                </span>
              </li>
            </ul>
          </div>

          {/* Institution Details */}
          <div className="flex flex-col items-center text-center">
            <h4 className="font-bold text-opinion-ochre uppercase tracking-wider text-[11px] mb-3">
              COMPANY & EDITORIAL
            </h4>

            <p className="text-secondary-fixed-dim text-[11px] leading-relaxed mb-3">
              Kerala Desam Publications Ltd.
              <br />
              #8-PBC-Amrutha Towers,Combara - Near Central Police Station
              <br />
              Ernakulam-682018-Kerala-India
              <br />
              Editor & Publisher:
              <br />
              <span className="text-surface-pure font-bold">K.O. Johnny (കെ.ഒ. ജോണി)</span>
            </p>

            <button
              onClick={scrollToTop}
              className="w-[220px] max-w-full flex items-center justify-center gap-1.5 py-2 rounded bg-surface-pure/10 hover:bg-surface-pure/20 text-surface-pure text-xs font-semibold transition-colors uppercase tracking-wider"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              BACK TO TOP
            </button>
          </div>

        </div>

        {/* Bottom Legal bar */}
        <div className="pt-6 flex flex-col items-center justify-center gap-4 text-xs text-secondary-fixed-dim text-center">
          <p>
            © 2026 കേരളദേശം (Kerala Desam). All rights reserved. | രജി. നമ്പർ: KL-ED-2025-09
          </p>
        </div>
      </div>
    </footer>
  );
}
