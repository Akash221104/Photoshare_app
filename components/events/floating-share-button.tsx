'use client';

import React, { useState } from 'react';
import { Share2, X } from 'lucide-react';
import { HostShareKit } from './host-share-kit';

interface FloatingShareButtonProps {
  eventId: string;
  eventName: string;
  hostName?: string;
  joinCode?: string;
}

export function FloatingShareButton({
  eventId,
  eventName,
  hostName,
  joinCode
}: FloatingShareButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 h-13 px-5 rounded-full bg-gradient-to-r from-[#FFB703] to-[#FB8500] text-white font-extrabold text-xs shadow-xl shadow-[#FB8500]/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border-2 border-white/40"
      >
        <Share2 size={18} />
        <span>Share Event</span>
      </button>

      {/* Share Modal Dialog */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md">
            <button
              onClick={() => setOpen(false)}
              className="absolute -top-3 -right-3 h-9 w-9 rounded-full bg-white text-zinc-700 shadow-lg flex items-center justify-center border border-zinc-200 hover:bg-zinc-100 z-50"
            >
              <X size={18} />
            </button>
            <HostShareKit
              eventId={eventId}
              eventName={eventName}
              hostName={hostName}
              joinCode={joinCode}
            />
          </div>
        </div>
      )}
    </>
  );
}
