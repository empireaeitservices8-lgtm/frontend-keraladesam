'use client';

import React, { useEffect } from 'react';
import { X, PlayCircle, Eye, Clock, Share2, ExternalLink } from 'lucide-react';
import { VideoItem } from '@/data/newsData';

interface VideoPlayerModalProps {
  video: VideoItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function VideoPlayerModal({ video, isOpen, onClose }: VideoPlayerModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !video) return null;

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(video.videoUrl || window.location.href);
      alert('വീഡിയോ ലിങ്ക് കോപ്പി ചെയ്തു!');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-neutral-950 text-white rounded-2xl overflow-hidden shadow-2xl border border-neutral-800 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 bg-neutral-900 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs text-white font-bold tracking-wide">
              <PlayCircle className="w-4 h-4 text-editorial-crimson" />
              കേരളദേശം വീഡിയോ ഷോർട്ട്സ്
            </span>
          </div>

          <div className="flex items-center gap-2">
            {video.videoUrl && (
              <a
                href={video.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
                title="Open original video"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={handleShare}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
              title="Share video"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player Frame */}
        <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
          {video.youtubeId ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
              title={video.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : video.videoUrl && (video.videoUrl.endsWith('.mp4') || video.videoUrl.endsWith('.webm')) ? (
            <video
              src={video.videoUrl}
              controls
              autoPlay
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="absolute inset-0 w-full h-full object-cover opacity-30"
              />
              <div className="relative z-10 flex flex-col items-center gap-3">
                <PlayCircle className="w-16 h-16 text-editorial-crimson animate-pulse" />
                <a
                  href={video.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-editorial-crimson text-white rounded-lg font-bold text-xs hover:bg-red-700 transition flex items-center gap-2"
                >
                  വീഡിയോ കാണുക <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Video Info Footer */}
        <div className="p-4 sm:p-5 bg-neutral-900 border-t border-neutral-800">
          <h3 className="font-headline text-sm sm:text-base md:text-lg font-bold text-white mb-2 leading-snug">
            {video.title}
          </h3>

          {video.description && (
            <p className="text-xs text-neutral-300 leading-relaxed mb-3 line-clamp-2">
              {video.description}
            </p>
          )}

          <div className="flex items-center justify-between text-xs text-neutral-400 pt-2 border-t border-neutral-800/80">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                <Eye className="w-3.5 h-3.5" /> {video.views} കാഴ്‌ചക്കാർ
              </span>
              <span className="flex items-center gap-1.5 text-neutral-400">
                <Clock className="w-3.5 h-3.5" /> {video.duration}
              </span>
            </div>
            <span className="text-[11px] text-neutral-500 font-mono">
              കേരളദേശം 24x7 ന്യൂസ്
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
