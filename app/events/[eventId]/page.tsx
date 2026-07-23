// app/events/[eventId]/page.tsx
// Public Event Welcome Page (Consumer-Grade Product Flow).
// Accessible to everyone without login.

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Camera, Sparkles, Upload, Users, ShieldCheck, ArrowRight,
  Calendar, User as UserIcon, CheckCircle2, Lock, ArrowLeft,
  X, Eye
} from 'lucide-react';

import { EventBanner } from '@/components/events/event-banner';
import { FloatingShareButton } from '@/components/events/floating-share-button';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface EventWelcomePageProps {
  params: Promise<{ eventId: string }>;
}

export default function EventWelcomePage({ params }: EventWelcomePageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { eventId } = React.use(params);
  const { user } = useCurrentUser();

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Entrance Loading Animation state for QR scans
  const [entranceDone, setEntranceDone] = useState(false);

  // Guest Name Dialog
  const [nameModalOpen, setNameModalOpen] = useState(false);
  const [guestNameInput, setGuestNameInput] = useState('');

  useEffect(() => {
    // Check local storage for pre-saved guest name
    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('photoshare_guest_name');
      if (savedName) setGuestNameInput(savedName);
    }
  }, []);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch(`/api/events/${eventId}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Event not found');
        }
        const data = await res.json();
        setEvent(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load event details.');
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [eventId]);

  // Handle Entrance Splash Animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setEntranceDone(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleJoinClick = () => {
    setNameModalOpen(true);
  };

  const handleProceedToGallery = (providedName?: string) => {
    const finalName = providedName !== undefined ? providedName.trim() : guestNameInput.trim();
    if (finalName && typeof window !== 'undefined') {
      localStorage.setItem('photoshare_guest_name', finalName);
    }
    setNameModalOpen(false);
    router.push(`/events/${eventId}/gallery`);
  };

  const handleProtectedAction = (actionType: 'upload' | 'selfie') => {
    if (user) {
      router.push(`/events/${eventId}/gallery?action=${actionType}`);
    } else {
      const returnUrl = `/events/${eventId}/gallery?action=${actionType}`;
      router.push(`/auth/sign-in?redirect=${encodeURIComponent(returnUrl)}`);
    }
  };

  // Entrance Loading Screen for QR Scans
  if (!entranceDone) {
    return (
      <div className="fixed inset-0 bg-[#FFFDF8] z-50 flex flex-col items-center justify-center p-6 space-y-4 animate-out fade-out duration-700">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#FFB703] to-[#FB8500] flex items-center justify-center text-white shadow-xl shadow-[#FB8500]/30 animate-bounce">
          <Camera size={32} />
        </div>
        <div className="text-center space-y-1">
          <span className="text-xs font-bold uppercase tracking-widest text-[#FB8500]">PhotoShare AI</span>
          <h2 className="text-xl font-bold font-serif-display text-[#1A1A1A] animate-pulse">
            Loading Event Experience...
          </h2>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFFDF8]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FB8500]" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FFFDF8] p-4 text-center">
        <div className="max-w-md space-y-4">
          <h2 className="text-2xl font-bold text-[#E63946]">Event Not Found</h2>
          <p className="text-sm text-[#525252]">
            {error || 'This event link or QR code may be invalid or expired.'}
          </p>
          <Link href="/">
            <button className="btn-primary-luxury text-xs">
              <ArrowLeft size={16} className="mr-2" /> Back to Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const isUploadsOpen = event.upload_mode !== 'CLOSED';

  return (
    <div className="min-h-screen bg-[#FFFDF8] text-[#1A1A1A] selection:bg-[#FFB703]/20 pb-24">

      {/* Floating Share Button */}
      <FloatingShareButton
        eventId={eventId}
        eventName={event.name}
        hostName={event.host_name || 'Host'}
        joinCode={event.join_code}
      />

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 space-y-8">

        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <Link href="/">
            <button className="btn-secondary-luxury !h-10 !px-4 !text-xs flex items-center gap-2">
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">PhotoShare AI</span>
            </button>
          </Link>

          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full border flex items-center gap-1.5 shadow-xs ${
              isUploadsOpen
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-[#E63946] border-rose-200'
            }`}>
              <span className={`h-2 w-2 rounded-full ${isUploadsOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              {isUploadsOpen ? '🟢 Uploads Open' : '🔴 Uploads Closed'}
            </span>
          </div>
        </div>

        {/* Cover Banner */}
        <EventBanner name={event.name} />

        {/* Event Header Details Card */}
        <div className="bg-white border-2 border-[rgba(255,170,80,0.22)] rounded-[32px] p-6 sm:p-10 shadow-xl space-y-6">

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 bg-[#FFF8F2] border border-[rgba(255,170,80,0.3)] px-3.5 py-1 rounded-full text-xs font-bold text-[#FB8500]">
                <Sparkles size={14} /> Official Private Event Page
              </div>
              <h1 className="text-3xl sm:text-5xl font-bold font-serif-display text-[#1A1A1A] leading-tight">
                {event.name}
              </h1>
              {event.description && (
                <p className="text-sm sm:text-base text-[#525252] max-w-2xl leading-relaxed">
                  {event.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-[#525252] pt-1">
                <span className="flex items-center gap-1.5 bg-zinc-100 px-3 py-1 rounded-full">
                  <UserIcon size={14} className="text-[#FB8500]" />
                  Hosted by <strong className="text-[#1A1A1A]">{event.host_name || 'Event Admin'}</strong>
                </span>
                <span className="flex items-center gap-1.5 bg-zinc-100 px-3 py-1 rounded-full">
                  <Calendar size={14} className="text-[#FB8500]" />
                  {event.created_at ? new Date(event.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : '2026'}
                </span>
              </div>
            </div>
          </div>

          {/* Live Preview Statistics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-[#FFF8F2] border border-[rgba(255,170,80,0.25)] p-4 rounded-2xl text-center space-y-1">
              <span className="text-xl sm:text-2xl font-black text-[#1A1A1A] block">{event.photo_count ?? 0}</span>
              <span className="text-[11px] font-bold text-[#FB8500] uppercase">Photos Uploaded</span>
            </div>
            <div className="bg-[#FFF8F2] border border-[rgba(255,170,80,0.25)] p-4 rounded-2xl text-center space-y-1">
              <span className="text-xl sm:text-2xl font-black text-[#1A1A1A] block">{event.member_count ?? 0}</span>
              <span className="text-[11px] font-bold text-[#FB8500] uppercase">Guests Joined</span>
            </div>
            <div className="bg-[#FFF8F2] border border-[rgba(255,170,80,0.25)] p-4 rounded-2xl text-center space-y-1">
              <span className="text-xl sm:text-2xl font-black text-emerald-600 block flex items-center justify-center gap-1">
                <ShieldCheck size={20} /> 100%
              </span>
              <span className="text-[11px] font-bold text-[#FB8500] uppercase">Private Vault</span>
            </div>
            <div className="bg-[#FFF8F2] border border-[rgba(255,170,80,0.25)] p-4 rounded-2xl text-center space-y-1">
              <span className="text-xl sm:text-2xl font-black text-[#1A1A1A] block flex items-center justify-center gap-1">
                <Sparkles size={20} className="text-[#FFB703]" /> AI Search
              </span>
              <span className="text-[11px] font-bold text-[#FB8500] uppercase">Instant Match</span>
            </div>
          </div>

          {/* Action CTAs Container */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[rgba(255,170,80,0.15)]">
            {/* Join Event Button */}
            <button
              onClick={handleJoinClick}
              className="btn-primary-luxury !h-13 !px-8 text-sm flex items-center justify-center gap-2 w-full sm:w-auto shadow-lg shadow-[#FB8500]/25"
            >
              <span>Join Event & Enter Gallery</span>
              <ArrowRight size={18} />
            </button>

            {/* Find Yourself with AI Button */}
            <button
              onClick={() => handleProtectedAction('selfie')}
              className="btn-secondary-luxury !h-13 !px-6 text-sm flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <Camera size={18} className="text-[#FB8500]" />
              <span>Find Yourself with AI</span>
            </button>

            {/* Upload Photos Button */}
            <button
              onClick={() => handleProtectedAction('upload')}
              className="px-6 h-13 rounded-full bg-white text-[#1A1A1A] border-2 border-[rgba(255,170,80,0.3)] hover:bg-[#FFF8F2] font-extrabold text-sm flex items-center justify-center gap-2 transition-all w-full sm:w-auto"
            >
              <Upload size={18} className="text-[#FB8500]" />
              <span>Upload Photos</span>
            </button>
          </div>
        </div>

        {/* "How It Works" Consumer Trust Section */}
        <div className="bg-[#FFF6EC] border border-[rgba(255,170,80,0.2)] rounded-[32px] p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#FB8500] bg-white px-3 py-1 rounded-full border border-[rgba(255,170,80,0.2)]">
              Private Photo Delivery
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif-display font-bold text-[#1A1A1A]">
              How PhotoShare AI Works for Guests
            </h3>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[rgba(255,170,80,0.2)] space-y-2 shadow-xs">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#FFB703] to-[#FB8500] flex items-center justify-center text-white font-extrabold text-sm shadow-sm">
                1
              </div>
              <h4 className="font-bold text-[#1A1A1A] text-base">Upload 1 Selfie</h4>
              <p className="text-xs text-[#525252] leading-relaxed">
                Take a quick selfie so AI can find all your photos from this event.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[rgba(255,170,80,0.2)] space-y-2 shadow-xs">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#FFB703] to-[#FB8500] flex items-center justify-center text-white font-extrabold text-sm shadow-sm">
                2
              </div>
              <h4 className="font-bold text-[#1A1A1A] text-base">Quick Selfie Check</h4>
              <p className="text-xs text-[#525252] leading-relaxed">
                Quick 2-second check to ensure only you can view your private photos.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[rgba(255,170,80,0.2)] space-y-2 shadow-xs">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#FFB703] to-[#FB8500] flex items-center justify-center text-white font-extrabold text-sm shadow-sm">
                3
              </div>
              <h4 className="font-bold text-[#1A1A1A] text-base">Get Your Private Gallery</h4>
              <p className="text-xs text-[#525252] leading-relaxed">
                Receive only the photos you are in. Zero public folder exposure — 100% private to you.
              </p>
            </div>
          </div>
        </div>

      </main>

      {/* Optional Guest Name Dialog */}
      {nameModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border-2 border-[#FB8500] rounded-[32px] p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 relative">
            <button
              onClick={() => setNameModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 p-1 rounded-full"
            >
              <X size={20} />
            </button>

            <div className="space-y-2 text-center">
              <div className="h-12 w-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#FB8500] mx-auto font-bold text-xl">
                👋
              </div>
              <h3 className="text-2xl font-bold font-serif-display text-[#1A1A1A]">Welcome to Event Gallery!</h3>
              <p className="text-xs text-[#525252]">What&apos;s your name? (Optional)</p>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="e.g. Akash Sharma"
                value={guestNameInput}
                onChange={(e) => setGuestNameInput(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-zinc-300 focus:border-[#FB8500] focus:ring-2 focus:ring-[#FB8500]/20 text-sm font-semibold outline-none"
              />

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleProceedToGallery('')}
                  className="flex-1 h-11 rounded-full bg-zinc-100 text-zinc-600 hover:bg-zinc-200 font-extrabold text-xs transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={() => handleProceedToGallery()}
                  className="flex-1 btn-primary-luxury !h-11 !px-4 !text-xs flex items-center justify-center gap-1.5"
                >
                  <span>Continue</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
