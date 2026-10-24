'use client';

import React, { useState } from 'react';
import { X, Play, Volume2, VolumeX, Radio, Maximize2, Users, Tv, RefreshCw } from 'lucide-react';

interface LiveTvModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChannelOption {
  id: string;
  name: string;
  tagline: string;
  videoId?: string;
}

const CHANNELS: ChannelOption[] = [
  {
    id: 'keraladesam',
    name: 'കേരളദേശം 24x7 HD',
    tagline: 'പ്രധാന ലൈവ് സ്റ്റുഡിയോ',
  },
  {
    id: 'asianet',
    name: 'ഏഷ്യാനെറ്റ് ന്യൂസ്',
    tagline: 'തത്സമയം വാർത്തകൾ',
    videoId: 'Ko18SgHA43I', // Asianet News Live stream
  },
  {
    id: 'twentyfour',
    name: '24 ന്യൂസ്',
    tagline: 'ലൈവ് ബ്രോഡ്കാസ്റ്റ്',
    videoId: '0U17y9a2q3w', // 24 News Live stream
  },
];

export default function LiveTvModal({ isOpen, onClose }: LiveTvModalProps) {
  const [selectedChannel, setSelectedChannel] = useState<ChannelOption>(CHANNELS[0]);
  const [isMuted, setIsMuted] = useState(false);
  const [viewerCount, setViewerCount] = useState(48219);
  const [useIframe, setUseIframe] = useState(false);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-5 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-ink-midnight text-surface-pure rounded-xl overflow-hidden shadow-2xl border border-secondary/30 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-neutral-900 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-live-alert animate-ping" />
            <span className="font-bold text-sm tracking-wide text-live-alert flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-live-alert" />
              <span>{selectedChannel.name}</span>
            </span>
            <span className="text-[11px] bg-red-950/80 text-red-300 font-semibold px-2 py-0.5 rounded border border-red-800/40">
              തത്സമയം
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Toggle */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 rounded-md hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors"
              title={isMuted ? 'ഓഡിയോ ഓൺ ചെയ്യുക' : 'മ്യൂട്ട് ചെയ്യുക'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-amber-400" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Close Modal */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors"
              title="ക്ലോസ് ചെയ്യുക"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player Display Area */}
        <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
          {useIframe && selectedChannel.videoId ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${selectedChannel.videoId}?autoplay=1&mute=${isMuted ? 1 : 0}`}
              title={selectedChannel.name}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <>
              {/* Broadcast Studio Backdrop */}
              <div
                className="absolute inset-0 bg-cover bg-center opacity-75 transform scale-105 transition-transform duration-1000"
                style={{
                  backgroundImage:
                    'url(https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80)',
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/70" />

              {/* On-Air Live Badge Top Left */}
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-live-alert text-white px-2.5 py-1 rounded-sm text-xs font-bold shadow-lg">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                LIVE
              </div>

              {/* Active Viewers Counter Top Right */}
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/70 backdrop-blur px-2.5 py-1 rounded text-xs text-white border border-white/10">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>{viewerCount.toLocaleString('ml-IN')} പേർ കാണുന്നു</span>
              </div>

              {/* Center Play Graphic */}
              <div className="z-10 text-center px-4">
                <div
                  onClick={() => {
                    setUseIframe(true);
                    if (selectedChannel.id === 'keraladesyam') {
                      setSelectedChannel(CHANNELS[1]);
                    }
                  }}
                  className="w-16 h-16 rounded-full bg-primary/90 text-white flex items-center justify-center mx-auto shadow-2xl hover:scale-110 transition-all cursor-pointer border-2 border-white/50 group"
                  title="തത്സമയ സ്ട്രീം കാണുക"
                >
                  <Play className="w-7 h-7 fill-current translate-x-0.5 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="mt-3 text-base md:text-lg font-bold text-white drop-shadow-md">
                  {selectedChannel.name} • പ്രൈം ടൈം വാർത്താ ബുള്ളറ്റിൻ
                </h3>
                <p className="text-xs text-neutral-300 drop-shadow mt-1">
                  തത്സമയ വിശകലനം • ലൈവ് സംപ്രേഷണം പുരോഗമിക്കുന്നു
                </p>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <button
                    onClick={() => {
                      setUseIframe(true);
                      setSelectedChannel(CHANNELS[1]);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold shadow transition-colors"
                  >
                    <Tv className="w-3.5 h-3.5" />
                    യൂട്യൂബ് ലൈവ് സ്ട്രീം പ്ലേ ചെയ്യുക
                  </button>
                </div>
              </div>

              {/* News Flash Ticker Inside Video */}
              <div className="absolute bottom-0 left-0 right-0 bg-neutral-950/95 border-t border-neutral-800 p-2.5 flex items-center gap-3">
                <span className="bg-editorial-crimson text-white text-[10px] font-bold px-2 py-0.5 rounded shrink-0 uppercase tracking-wider">
                  ബ്രേക്കിംഗ്
                </span>
                <div className="overflow-hidden whitespace-nowrap text-xs text-neutral-200 font-medium">
                  <span className="inline-block animate-ticker">
                    വയനാട് തുരങ്കപാത നിർമാണത്തിന് കേന്ദ്ര പരിസ്ഥിതി അനുമതി ലഭിച്ചു; ടെൻഡർ നടപടികൾ വേഗത്തിലാക്കാൻ നിർദേശം • കൊച്ചി മെട്രോ കാക്കനാട് പാത ട്രയൽ റൺ ഡിസംബറിൽ • സംസ്ഥാനത്ത് വേനൽമഴ ശക്തമാകാൻ സാധ്യത
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Channel Selection & Audio Quality Ribbon */}
        <div className="p-3.5 bg-neutral-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs border-t border-neutral-800">
          <div className="flex items-center flex-wrap gap-2">
            <span className="text-neutral-400 font-semibold flex items-center gap-1">
              <Tv className="w-3.5 h-3.5 text-primary" /> ചാനലുകൾ:
            </span>
            {CHANNELS.map((ch) => {
              const isCurrent = selectedChannel.id === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => {
                    setSelectedChannel(ch);
                    if (ch.videoId) {
                      setUseIframe(true);
                    } else {
                      setUseIframe(false);
                    }
                  }}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    isCurrent
                      ? 'bg-primary text-white font-bold shadow-sm'
                      : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-white'
                  }`}
                >
                  {ch.name}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <span className="text-neutral-400 text-[11px] hidden sm:inline">
              HD 1080p • മലയാളം
            </span>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-white font-medium transition-colors"
            >
              വാർത്തകളിലേക്ക് മടങ്ങുക
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
