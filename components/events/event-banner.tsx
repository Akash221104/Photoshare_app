import React from 'react';
import { Camera, ShieldCheck, Sparkles, Share2, LogOut } from 'lucide-react';

interface EventBannerProps {
  name: string;
  onInviteClick?: () => void;
  onLeaveClick?: () => void;
  isHost?: boolean;
}

export function EventBanner({ name, onInviteClick, onLeaveClick, isHost }: EventBannerProps) {
  const shortName = name.substring(0, Math.min(name.length, 8));

  return (
    <div className="relative w-full min-h-56 sm:min-h-64 rounded-[32px] bg-gradient-to-r from-[#0E0E12] via-[#1B1924] to-[#14121A] flex flex-col justify-between p-6 sm:p-8 overflow-hidden border-2 border-zinc-800/80 shadow-2xl group">
      
      {/* Ambient Blurred Warm Gold & Rose Light Orbs */}
      <div className="absolute -top-12 -left-12 w-72 h-72 bg-[#FFB703]/15 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-72 h-72 bg-[#FB8500]/15 rounded-full blur-[80px] pointer-events-none" />

      {/* Modern Micro-Grid Canvas Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,183,3,0.12)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-40" />

      {/* Stylized Giant Event Watermark in Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
        <span className="text-white/[0.04] font-serif-display font-black text-7xl sm:text-9xl tracking-widest uppercase scale-110 group-hover:scale-125 transition-transform duration-700">
          {shortName}
        </span>
      </div>

      {/* Top Banner Bar: Status Badges */}
      <div className="relative z-10 flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold shadow-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live Event Vault</span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-extrabold shadow-sm">
          <ShieldCheck size={14} className="text-[#FFB703]" />
          <span>AI Encryption Active</span>
        </div>
      </div>

      {/* Center Event Title Display */}
      <div className="relative z-10 space-y-1 my-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#FFB703] to-[#FB8500] flex items-center justify-center text-white shadow-lg shadow-[#FB8500]/25 shrink-0">
            <Camera size={20} />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif-display font-bold text-white tracking-tight">
            {name}
          </h2>
        </div>
      </div>

      {/* Bottom Banner Bar: Stats Chips & Action Triggers */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800/80 pt-4">
        <div className="flex items-center gap-2 text-xs text-zinc-300 font-semibold">
          <Sparkles size={14} className="text-[#FFB703]" />
          <span>Facial Vector Indexing Enabled</span>
        </div>

        {/* Action Buttons inside Banner Footer */}
        <div className="flex items-center gap-2">
          {onInviteClick && (
            <button
              onClick={onInviteClick}
              className="px-4 h-9 rounded-full bg-gradient-to-r from-[#FFB703] to-[#FB8500] text-white font-extrabold text-xs shadow-md shadow-[#FB8500]/30 hover:scale-105 transition-all flex items-center gap-1.5"
            >
              <Share2 size={14} />
              <span>Invite Guests</span>
            </button>
          )}

          {!isHost && onLeaveClick && (
            <button
              onClick={onLeaveClick}
              className="px-3.5 h-9 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 font-extrabold text-xs flex items-center gap-1.5 transition-all"
            >
              <LogOut size={14} />
              <span>Leave Event</span>
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
