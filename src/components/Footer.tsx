'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Mail, Check, ArrowUp, Send, Phone, MapPin, Globe } from 'lucide-react';
import { KERALA_DISTRICTS } from '@/data/newsData';
import { subscribeNewsletter } from '@/lib/api';

// Social media accounts configuration for client
const SOCIAL_ACCOUNTS = [
  {
    name: 'Facebook',
    title: 'കേരളദേശം ഫെയ്‌സ്ബുക്ക് പേജ് സന്ദർശിക്കുക',
    href: 'https://www.facebook.com/keraladesam',
    hoverBg: 'hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2]',
    icon: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    name: 'YouTube',
    title: 'കേരളദേശം യൂട്യൂബ് ചാനൽ സബ്സ്ക്രൈബ് ചെയ്യുക',
    href: 'https://www.youtube.com/@keraladesam',
    hoverBg: 'hover:bg-[#FF0000] hover:text-white hover:border-[#FF0000]',
    icon: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    name: 'Instagram',
    title: 'കേരളദേശം ഇൻസ്റ്റാഗ്രാം പേജ് ഫോളോ ചെയ്യുക',
    href: 'https://www.instagram.com/keraladesam',
    hoverBg: 'hover:bg-gradient-to-tr hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF] hover:text-white hover:border-transparent',
    icon: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    name: 'X (Twitter)',
    title: 'കേരളദേശം എക്സ് (Twitter) പേജ് സന്ദർശിക്കുക',
    href: 'https://twitter.com/keraladesam',
    hoverBg: 'hover:bg-white hover:text-black hover:border-white',
    icon: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: 'WhatsApp Channel',
    title: 'കേരളദേശം ഔദ്യോഗിക വാട്സാപ്പ് ചാനലിൽ ചേരുക',
    href: 'https://whatsapp.com/channel/keraladesam',
    hoverBg: 'hover:bg-[#25D366] hover:text-white hover:border-[#25D366]',
    icon: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.301-.15-1.78-.877-2.056-.978-.276-.1-.477-.15-.678.15-.2.301-.777.978-.953 1.18-.175.201-.351.226-.652.075-.301-.15-1.272-.469-2.423-1.496-.896-.799-1.5-1.786-1.677-2.088-.175-.301-.019-.464.132-.614.135-.135.301-.351.451-.527.15-.175.2-.301.301-.501.1-.201.05-.376-.025-.526-.075-.15-.677-1.633-.928-2.238-.244-.589-.493-.509-.678-.519-.175-.01-.376-.01-.577-.01-.201 0-.527.075-.802.376-.276.301-1.053 1.029-1.053 2.508s1.078 2.909 1.229 3.11c.15.201 2.122 3.24 5.141 4.544.718.31 1.279.495 1.716.634.721.229 1.377.197 1.896.119.579-.087 1.78-.727 2.031-1.43.25-.702.25-1.304.175-1.43-.075-.125-.276-.201-.577-.351zM12.04 21.785a9.71 9.71 0 0 1-4.966-1.356l-.356-.211-3.693.969.986-3.6-.231-.368A9.728 9.728 0 0 1 2.303 12.05C2.303 6.677 6.666 2.314 12.04 2.314c2.603 0 5.05 1.014 6.892 2.856a9.686 9.686 0 0 1 2.854 6.88c0 5.374-4.363 9.735-9.746 9.735zm8.307-16.64A11.66 11.66 0 0 0 12.04.314C5.565.314.298 5.58.298 12.05c0 2.067.538 4.086 1.56 5.867L0 23.703l5.968-1.566a11.69 11.69 0 0 0 5.772 1.618h.005c6.474 0 11.741-5.267 11.741-11.737 0-3.136-1.222-6.084-3.439-8.303z" />
      </svg>
    ),
  },
  {
    name: 'Telegram',
    title: 'കേരളദേശം ടെലഗ്രാം ഗ്രൂപ്പ് സന്ദർശിക്കുക',
    href: 'https://t.me/keraladesam',
    hoverBg: 'hover:bg-[#229ED9] hover:text-white hover:border-[#229ED9]',
    icon: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.562 8.161c-.18.786-.889 3.75-1.25 5.334-.153.67-.398.895-.634.917-.514.047-.905-.34-1.402-.666-.78-.51-1.222-.827-1.977-1.325-.873-.574-.307-.89.19-.408.13.126 2.388 2.188 2.433 2.238.057.062.109.117.005.176-.104.059-.444-.067-.624-.132-.38-.138-2.433-1.611-3.435-2.29-.462-.313-.88-.47-1.253-.462-.411.008-1.203.232-1.792.423-.722.235-.806.353-.78.752.015.228.329.463.942.705 3.693 1.609 6.16 2.67 7.4 3.183 3.52 1.464 4.252 1.718 4.73 1.727.105.002.339-.023.492-.147.129-.105.165-.246.182-.345.017-.099.039-.323.022-.498z" />
      </svg>
    ),
  },
];

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
            <Link href="/" className="inline-block mb-3 hover:opacity-95 transition-opacity" aria-label="കേരളദേശം">
              <div className="relative h-14 sm:h-16 md:h-20 w-72 sm:w-84 md:w-96 max-w-full">
                <Image
                  src="/logo1.png"
                  alt="കേരളദേശം"
                  fill
                  className="object-contain object-left brightness-125 contrast-105 filter drop-shadow-[0_2px_14px_rgba(255,255,255,0.18)]"
                  priority
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

            {/* Social Media Links for Client */}
            <div className="mt-5 pt-4 border-t border-surface-pure/10">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-opinion-ochre mb-2.5">
                സോഷ്യൽ മീഡിയയിൽ പിന്തുടരുക (Follow Us)
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {SOCIAL_ACCOUNTS.map((acc) => (
                  <a
                    key={acc.name}
                    href={acc.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={acc.title}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-pure/10 border border-surface-pure/15 text-surface-pure text-xs font-semibold transition-all duration-200 shadow-2xs hover:scale-105 ${acc.hoverBg}`}
                  >
                    {acc.icon}
                    <span className="text-[11px]">{acc.name}</span>
                  </a>
                ))}
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
              <span className="text-surface-pure font-bold">K.O. Johney (കെ.ഒ. ജോണി)</span>
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
