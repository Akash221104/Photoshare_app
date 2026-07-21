// components/events/event-banner.tsx
// Cover banner representation for active event workspaces (Luxury 28px aesthetic).

import React from 'react';

interface EventBannerProps {
  name: string;
}

export function EventBanner({ name }: EventBannerProps) {
  return (
    <div className="relative w-full h-48 sm:h-56 rounded-[28px] bg-gradient-to-r from-[#FFB703] via-[#FB8500] to-[#FF6B6B] flex items-center justify-center overflow-hidden border border-[rgba(255,170,80,0.3)] shadow-md">
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.25)_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
      <span className="text-white/30 font-serif-display font-black text-6xl sm:text-7xl tracking-widest uppercase selection:bg-transparent animate-pulse">
        {name.substring(0, Math.min(name.length, 6))}
      </span>
    </div>
  );
}
