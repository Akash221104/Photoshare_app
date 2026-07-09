// components/events/event-banner.tsx
// Cover banner representation for active event workspaces.

import React from 'react';

interface EventBannerProps {
  name: string;
}

export function EventBanner({ name }: EventBannerProps) {
  return (
    <div className="relative w-full h-40 sm:h-48 rounded-xl bg-gradient-to-r from-zinc-800 via-zinc-950 to-zinc-800 dark:from-zinc-900 dark:via-black dark:to-zinc-900 flex items-center justify-center overflow-hidden border border-zinc-200/50 dark:border-zinc-800/50 shadow-inner">
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
      <span className="text-zinc-700/30 dark:text-zinc-600/20 font-black text-6xl tracking-widest uppercase selection:bg-transparent animate-pulse">
        {name.substring(0, Math.min(name.length, 6))}
      </span>
    </div>
  );
}
