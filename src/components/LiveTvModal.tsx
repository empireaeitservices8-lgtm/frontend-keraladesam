'use client';
import { getRealLiveTv } from '@/lib/api';
import React, { useState, useEffect } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Radio,
  Users,
  Tv,
  ExternalLink,
  Settings,
  Check,
  Play,
  Maximize2
} from 'lucide-react';

interface LiveTvModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChannelOption {
  id: string;
  name: string;
  tagline: string;
  videoId?: string;
  channelId?: string;
}

// Helper to extract YouTube video ID from various URL formats
function extractYouTubeId(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  const match = trimmed.match(
    /(?:youtube\.com\/(?:watch\?.*v=|shorts\/|embed\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i
  );
  return match ? match[1] : '';
}

export default function LiveTvModal({ isOpen, onClose }: LiveTvModalProps) {
  const defaultKeralaDesamId =
    process.env.NEXT_PUBLIC_LIVETV_YOUTUBE_ID || '';

  const [customVideoId, setCustomVideoId] = useState<string>('');
  const [inputUrl, setInputUrl] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [viewerCount, setViewerCount] = useState(48219);

  // Default channels list
  // Default channels list (കേരളദേശം മാത്രം)
  const CHANNELS: ChannelOption[] = [
    {
      id: 'keraladesam',
      name: 'കേരളദേശം 24x7 HD',
      tagline: 'പ്രധാന ലൈവ് സ്റ്റുഡിയോ',
      videoId: customVideoId || defaultKeralaDesamId,
    },
  ];

  const [selectedChannel, setSelectedChannel] = useState<ChannelOption>(CHANNELS[0]);

  // Fetch real-time active Live TV stream from Backend/Admin
  useEffect(() => {
    getRealLiveTv().then((cfg) => {
      if (cfg && cfg.videoId) {
        setCustomVideoId(cfg.videoId);
      }
    });
  }, [isOpen]);


  // Sync selectedChannel when customVideoId changes
  useEffect(() => {
    if (selectedChannel.id === 'keraladesam') {
      setSelectedChannel((prev) => ({
        ...prev,
        videoId: customVideoId || defaultKeralaDesamId,
      }));
    }
  }, [customVideoId, defaultKeralaDesamId]);

  if (!isOpen) return null;

  const currentVideoId = selectedChannel.videoId || defaultKeralaDesamId;

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const id = extractYouTubeId(inputUrl);
    if (id) {
      setCustomVideoId(id);
      if (typeof window !== 'undefined') {
        localStorage.setItem('kd_custom_livetv_id', id);
      }
      setSelectedChannel({
        id: 'keraladesam',
        name: 'കേരളദേശം 24x7 HD',
        tagline: 'കസ്റ്റം ലൈവ് സ്ട്രീം',
        videoId: id,
      });
      setInputUrl('');
      setShowConfig(false);
    } else {
      alert('സാധുവായ ഒരു YouTube Live URL അല്ലെങ്കിൽ Video ID നൽകുക.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 md:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-neutral-950 text-surface-pure rounded-2xl overflow-hidden shadow-2xl border border-neutral-800 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-neutral-900 border-b border-neutral-800">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
            <span className="font-bold text-xs sm:text-sm tracking-wide text-white flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-red-500 shrink-0" />
              <span>{selectedChannel.name}</span>
            </span>
            <span className="text-[10px] sm:text-[11px] bg-red-600 text-white font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              LIVE 24x7
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Custom URL Toggle Settings */}
            <button
              onClick={() => setShowConfig(!showConfig)}
              className={`p-1.5 rounded-md transition-colors ${showConfig
                  ? 'bg-red-600 text-white'
                  : 'hover:bg-neutral-800 text-neutral-300 hover:text-white'
                }`}
              title="ലൈവ് സ്ട്രീം ലിങ്ക് മാറ്റുക (Settings)"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Audio Toggle */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 rounded-md hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-amber-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-neutral-300" />
              )}
            </button>

            {/* Open on YouTube */}
            {currentVideoId && (
              <a
                href={`https://www.youtube.com/@KERALADESAMPARTY-p7y`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-md hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors hidden sm:block"
                title="യൂട്യൂബിൽ കാണുക"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {/* Close Modal */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Custom Stream URL Configuration Box */}
        {showConfig && (
          <form
            onSubmit={handleApplyCustomUrl}
            className="bg-neutral-900/90 border-b border-neutral-800 p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 animate-in slide-in-from-top-2"
          >
            <div className="flex-1">
              <label className="text-[11px] text-neutral-400 font-semibold mb-1 block">
                കേരളദേശം സ്വന്തം YouTube Live URL അല്ലെങ്കിൽ Video ID ഇവിടെ നൽകുക:
              </label>
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="ഉദാ: https://www.youtube.com/@KERALADESAMPARTY-p7y അല്ലെങ്കിൽ ലൈവ് ലിങ്ക്"
                className="w-full bg-black/60 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
              />
            </div>
            <div className="flex items-center gap-2 shrink-0 sm:pt-4">
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                പ്ലേ ചെയ്യുക
              </button>
              {customVideoId && (
                <button
                  type="button"
                  onClick={() => {
                    setCustomVideoId('');
                    if (typeof window !== 'undefined') {
                      localStorage.removeItem('kd_custom_livetv_id');
                    }
                  }}
                  className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-medium transition-colors"
                >
                  റീസെറ്റ്
                </button>
              )}
            </div>
          </form>
        )}

        {/* Video Player Display Area - Auto Playing Iframe */}
        <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
          {currentVideoId ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${currentVideoId}?autoplay=1&mute=${isMuted ? 1 : 0
                }&playsinline=1&rel=0`}
              title={selectedChannel.name}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="text-center p-6 text-neutral-400 text-xs">
              ലൈവ് സ്ട്രീം ലഭ്യമായിട്ടില്ല. മുകളിലെ സെറ്റിംഗ്സിൽ നിന്ന് യൂട്യൂബ് ലൈവ് ലിങ്ക് നൽകുക.
            </div>
          )}

          {/* Active Viewers Counter Top Right Overlay */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/75 backdrop-blur-xs px-2 py-1 rounded text-[11px] text-white border border-white/10 pointer-events-none">
            <Users className="w-3 h-3 text-emerald-400" />
            <span>{viewerCount.toLocaleString('en-IN')} watching</span>
          </div>
        </div>

        {/* Channel Selection Ribbon */}
        <div className="p-3 bg-neutral-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs border-t border-neutral-800">
          <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 w-full md:w-auto">
            <span className="text-neutral-400 font-bold flex items-center gap-1 uppercase tracking-wider text-[11px] shrink-0 mr-1">
              <Tv className="w-3.5 h-3.5 text-red-500" /> CHANNELS:
            </span>

            {CHANNELS.map((ch) => {
              const isCurrent = selectedChannel.id === ch.id;
              const targetUrl = currentVideoId
                ? `https://www.youtube.com/watch?v=${currentVideoId}`
                : 'https://www.youtube.com/@KERALADESAMPARTY-p7y';

              return (
                <a
                  key={ch.id}
                  href={targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${isCurrent
                      ? 'bg-red-600 text-white font-bold shadow-sm scale-105'
                      : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-white border border-neutral-800'
                    }`}
                  title="ഔദ്യോഗിക YouTube ചാനൽ തുറക്കുക"
                >
                  <span>{ch.name}</span>
                  <ExternalLink className="w-3 h-3 opacity-80" />
                </a>
              );
            })}
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-2 md:pt-0 border-neutral-800">
            <span className="text-neutral-400 text-[11px]">
              HD 1080p • തത്സമയം
            </span>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-bold transition-colors uppercase tracking-wider text-[11px]"
            >
              CLOSE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
