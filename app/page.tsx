// app/page.tsx
// Storytelling landing page for PhotoShare AI.
// Built with a premium dark theme, glassmorphism, responsive sections, and full interactive simulations.

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Camera, 
  ArrowRight, 
  Shield, 
  Sparkles, 
  Lock, 
  Upload, 
  Search, 
  Download, 
  MessageSquare, 
  Users, 
  Calendar, 
  Compass, 
  Check, 
  AlertCircle,
  HelpCircle,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mock images representing incorrect matches for the chat simulator
const WRONG_IMAGES = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=60'
];

// Mock images representing correct matches for the AI scanner
const MATCHED_IMAGES = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&auto=format&fit=crop&q=80'
];

export default function Home() {
  // Chat Simulator State
  const [chatStep, setChatStep] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setChatStep((prev) => (prev + 1) % 9);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  // AI Scanner Phone State
  const [scanStep, setScanStep] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setScanStep((prev) => (prev + 1) % 5);
    }, 3600);
    return () => clearInterval(interval);
  }, []);

  // Interactive Demo State
  const [demoState, setDemoState] = useState<'idle' | 'uploading' | 'scanning' | 'searching' | 'results'>('idle');
  const [demoProgress, setDemoProgress] = useState(0);
  const [demoMatches, setDemoMatches] = useState(0);

  const startDemo = () => {
    setDemoState('uploading');
    setDemoProgress(0);
    setDemoMatches(0);

    // Step 1: Uploading Mock Selfie
    setTimeout(() => {
      setDemoState('scanning');
      // Step 2: Scanning Face Animation
      setTimeout(() => {
        setDemoState('searching');
        // Step 3: Searching counter animation
        let count = 0;
        const countInterval = setInterval(() => {
          count += 12;
          if (count >= 126) {
            clearInterval(countInterval);
            setDemoMatches(126);
            setDemoState('results');
          } else {
            setDemoMatches(count);
          }
        }, 150);
      }, 2500);
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#09090B] text-[#FAFAFA] font-sans antialiased overflow-hidden selection:bg-[#6366F1]/30">
      {/* Background Glow Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#6366F1]/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] bg-[#06B6D4]/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[20%] w-[45%] h-[45%] bg-[#6366F1]/5 rounded-full blur-[130px] pointer-events-none" />

      {/* Floating Header */}
      <header className="fixed top-0 left-0 right-0 h-16 border-b border-white/5 bg-[#09090B]/60 backdrop-blur-md z-50 flex items-center justify-between px-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-[#6366F1] flex items-center justify-center shadow-md shadow-[#6366F1]/20">
            <Camera size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-[#FAFAFA]">PhotoShare AI</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/auth/sign-in">
            <Button variant="ghost" className="text-[#A1A1AA] hover:text-[#FAFAFA]">Sign In</Button>
          </Link>
          <Link href="/auth/sign-up">
            <Button className="bg-[#6366F1] hover:bg-[#6366F1]/90 text-white shadow-md shadow-[#6366F1]/20 transition-all duration-300">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 pt-24">
        <section className="relative px-6 max-w-7xl mx-auto w-full py-12 md:py-20 flex flex-col items-center">
          {/* Main Title & Slogan */}
          <div className="text-center max-w-3xl space-y-6 mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/5 bg-[#18181B] text-xs font-semibold text-[#A1A1AA]">
              <Sparkles size={12} className="text-indigo-400" />
              Next-Gen Private Photo Delivery
            </div>

            <h1 className="text-4xl sm:text-7xl font-extrabold tracking-tight leading-none bg-gradient-to-b from-[#FAFAFA] to-[#A1A1AA] bg-clip-text text-transparent">
              STOP ASKING <br />
              <span className="text-[#6366F1]">&ldquo;Bro, send me my photos.&rdquo;</span>
            </h1>

            <p className="text-base sm:text-lg text-[#A1A1AA] max-w-2xl mx-auto font-normal leading-relaxed">
              After every wedding, college fest, trip, or birthday party, someone spends hours manually sorting through thousands of photos just to send everyone their own pictures. PhotoShare AI does it automatically and securely.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/auth/sign-up">
                <Button size="lg" className="bg-[#FAFAFA] text-[#09090B] hover:bg-[#FAFAFA]/95 px-8 h-12 shadow-lg transition-transform duration-300 hover:scale-[1.02] font-semibold">
                  Create Your First Event
                </Button>
              </Link>
              <a href="#demo-section">
                <Button size="lg" variant="outline" className="border-white/10 hover:bg-white/5 text-[#FAFAFA] px-8 h-12">
                  Watch Demo
                </Button>
              </a>
            </div>
          </div>

          {/* Split Hero: The Pain vs The Solution */}
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl w-full items-stretch pt-8">
            
            {/* LEFT PHONE: The Pain (Chat Simulator) */}
            <div className="flex flex-col items-center">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-rose-500 mb-4 flex items-center gap-1.5">
                <AlertCircle size={14} /> The Manual Pain
              </h3>
              
              <div className="w-full max-w-sm aspect-[9/16] rounded-[40px] border-[6px] border-zinc-800 bg-zinc-950 p-4 shadow-2xl relative overflow-hidden flex flex-col">
                {/* Phone Speaker & Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-28 bg-zinc-800 rounded-b-xl flex items-center justify-center z-20">
                  <div className="w-10 h-1 bg-zinc-900 rounded-full" />
                </div>

                {/* Chat App Header */}
                <div className="flex items-center gap-2 pb-3 border-b border-white/5 mt-4">
                  <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xs text-zinc-300">R</div>
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-100">Rahul (Friend)</h4>
                    <span className="text-[10px] text-zinc-500">Active now</span>
                  </div>
                </div>

                {/* Chat Conversation Flow */}
                <div className="flex-1 space-y-3 pt-3 overflow-y-auto text-xs scrollbar-thin">
                  {/* Msg 1 */}
                  {chatStep >= 0 && (
                    <div className="flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="bg-[#6366F1]/20 text-indigo-200 rounded-2xl rounded-tr-none px-3 py-2 max-w-[80%]">
                        Bro... Can you send me my photos?
                      </div>
                    </div>
                  )}

                  {/* Msg 2 */}
                  {chatStep >= 1 && (
                    <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="bg-zinc-800 text-zinc-200 rounded-2xl rounded-tl-none px-3 py-2 max-w-[80%]">
                        Sure.
                      </div>
                    </div>
                  )}

                  {/* Msg 3 */}
                  {chatStep >= 2 && (
                    <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="bg-zinc-800 text-zinc-200 rounded-2xl rounded-tl-none px-3 py-2 max-w-[80%]">
                        There are around 1200 photos 😅
                      </div>
                    </div>
                  )}

                  {/* Msg 4 */}
                  {chatStep >= 3 && (
                    <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="bg-zinc-800 text-zinc-200 rounded-2xl rounded-tl-none px-3 py-2 max-w-[80%]">
                        Give me some time.
                      </div>
                    </div>
                  )}

                  {/* Msg 5 (Typing Indicator) */}
                  {chatStep === 4 && (
                    <div className="flex justify-start animate-in fade-in duration-300">
                      <div className="bg-zinc-800 text-zinc-400 rounded-2xl rounded-tl-none px-3 py-2 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-typing-dot-1" />
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-typing-dot-2" />
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-typing-dot-3" />
                      </div>
                    </div>
                  )}

                  {/* Msg 6 (Incorrect Images Sent) */}
                  {chatStep >= 5 && (
                    <div className="space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="flex justify-start">
                        <div className="bg-zinc-800 text-zinc-200 rounded-2xl rounded-tl-none px-3 py-2 max-w-[80%]">
                          Are these yours?
                        </div>
                      </div>
                      <div className="flex justify-start gap-1 max-w-[80%] ml-2">
                        {WRONG_IMAGES.map((img, i) => (
                          <div key={i} className="h-14 w-14 rounded-lg bg-zinc-800 overflow-hidden border border-white/10 relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={img} alt="wrong match" className="h-full w-full object-cover grayscale opacity-75" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Msg 7 */}
                  {chatStep >= 6 && (
                    <div className="flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="bg-[#6366F1]/20 text-indigo-200 rounded-2xl rounded-tr-none px-3 py-2 max-w-[80%]">
                        😭 Those aren&apos;t mine.
                      </div>
                    </div>
                  )}

                  {/* Msg 8 */}
                  {chatStep >= 7 && (
                    <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="bg-zinc-800 text-zinc-200 rounded-2xl rounded-tl-none px-3 py-2 max-w-[80%] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
                        Wait... Still searching...
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT PHONE: The Solution (PhotoShare AI) */}
            <div className="flex flex-col items-center">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-500 mb-4 flex items-center gap-1.5">
                <Check size={14} className="text-emerald-500" /> PhotoShare Solution
              </h3>

              <div className="w-full max-w-sm aspect-[9/16] rounded-[40px] border-[6px] border-zinc-800 bg-[#09090B] p-4 shadow-2xl relative overflow-hidden flex flex-col">
                {/* Phone Speaker & Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-28 bg-zinc-800 rounded-b-xl flex items-center justify-center z-20">
                  <div className="w-10 h-1 bg-zinc-900 rounded-full" />
                </div>

                {/* App Brand Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/5 mt-4">
                  <div className="flex items-center gap-1.5">
                    <div className="h-6 w-6 rounded-md bg-[#6366F1] flex items-center justify-center">
                      <Camera size={12} className="text-white" />
                    </div>
                    <span className="text-[10px] font-bold text-zinc-200">PhotoShare AI</span>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>

                {/* AI App Simulated Flow */}
                <div className="flex-1 flex flex-col pt-3 space-y-4">
                  {/* Step 0: Selfie Upload Form */}
                  {scanStep === 0 && (
                    <div className="flex-1 flex flex-col justify-center items-center text-center space-y-3 animate-in fade-in duration-300">
                      <div className="h-16 w-16 rounded-full border border-dashed border-zinc-700 flex items-center justify-center bg-zinc-900/50">
                        <Upload size={20} className="text-[#A1A1AA] animate-bounce" />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-zinc-200">Upload Your Selfie</h4>
                        <p className="text-[9px] text-zinc-500 max-w-[150px] mx-auto mt-0.5">Let AI scan event photos and find only your face</p>
                      </div>
                      <div className="h-7 w-28 rounded-md bg-[#6366F1] flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                        Select Photo
                      </div>
                    </div>
                  )}

                  {/* Step 1: Laser Scan Face */}
                  {scanStep === 1 && (
                    <div className="flex-1 flex flex-col justify-center items-center text-center space-y-3 animate-in fade-in duration-300">
                      <div className="h-32 w-32 rounded-2xl border border-zinc-800 overflow-hidden relative bg-zinc-900 shadow-inner">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80" 
                          alt="Selfie" 
                          className="h-full w-full object-cover" 
                        />
                        {/* Scanning Laser Line */}
                        <div className="absolute left-0 right-0 h-0.5 bg-indigo-500/80 shadow-[0_0_10px_2px_rgba(99,102,241,0.6)] animate-laser-scan" />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-zinc-200">Analyzing Facial Vector</h4>
                        <p className="text-[9px] text-zinc-500">Detecting key facial metrics...</p>
                      </div>
                    </div>
                  )}

                  {/* Step 2: AI Searching Event Photos */}
                  {scanStep === 2 && (
                    <div className="flex-1 flex flex-col justify-center items-center text-center space-y-3 animate-in fade-in duration-300">
                      <div className="h-10 w-10 rounded-full border border-indigo-500/30 flex items-center justify-center animate-spin border-t-indigo-500">
                        <Search size={16} className="text-[#6366F1]" />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-zinc-200">Searching Photos</h4>
                        <p className="text-[10px] font-mono text-zinc-400 mt-1">Scanning 1,247 images...</p>
                        <p className="text-[9px] text-zinc-500 mt-0.5">Matching embeddings in Postgres...</p>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Match Result */}
                  {scanStep === 3 && (
                    <div className="flex-1 flex flex-col justify-center items-center text-center space-y-4 animate-in fade-in duration-300">
                      <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 animate-pulse-ring">
                        <Sparkles size={24} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-extrabold text-zinc-100">126 Matches Found!</h4>
                        <p className="text-[9px] text-zinc-500 max-w-[160px]">All matches are verified and ready for download.</p>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Matched Gallery Display */}
                  {scanStep === 4 && (
                    <div className="flex-1 flex flex-col justify-between animate-in fade-in duration-300">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                          <span className="text-[10px] font-semibold text-zinc-300">Your Private Album (126)</span>
                          <span className="text-[9px] text-[#06B6D4] font-semibold flex items-center gap-0.5">
                            <Lock size={8} /> Secure
                          </span>
                        </div>
                        {/* Image Grid */}
                        <div className="grid grid-cols-2 gap-1.5">
                          {MATCHED_IMAGES.map((img, i) => (
                            <div key={i} className="aspect-square rounded-lg overflow-hidden border border-white/5 relative">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={img} alt="Matched pic" className="h-full w-full object-cover" />
                              {/* Bounding box on face */}
                              <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border border-emerald-500/80 rounded shadow-[0_0_4px_1px_rgba(34,197,94,0.4)]" />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Download Action */}
                      <div className="w-full bg-[#6366F1] hover:bg-[#6366F1]/90 rounded-lg h-8 flex items-center justify-center gap-1.5 text-xs font-bold text-white shadow-sm mt-2">
                        <Download size={12} />
                        Download All 126 Photos
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Section 2: Problem Timeline */}
        <section className="px-6 py-20 bg-zinc-950/40 border-y border-white/5 relative">
          <div className="max-w-7xl mx-auto w-full">
            <div className="text-center space-y-3 mb-16">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-rose-500">The Friction</h2>
              <p className="text-3xl sm:text-4xl font-extrabold text-[#FAFAFA]">The Endless Event Photo Loop</p>
              <p className="text-[#A1A1AA] max-w-xl mx-auto text-sm">Every single gathering ends with the exact same frustrating manual workflow.</p>
            </div>

            {/* Timeline Steps */}
            <div className="grid md:grid-cols-7 gap-6 items-center max-w-6xl mx-auto relative">
              {/* Step 1 */}
              <div className="bg-[#18181B] border border-white/5 rounded-2xl p-5 text-center space-y-2 hover:border-white/10 transition-all duration-300">
                <span className="text-xs font-bold text-rose-400">01</span>
                <h4 className="font-bold text-sm text-zinc-100">Event Ends</h4>
                <p className="text-xs text-zinc-400">The party or trip wraps up successfully.</p>
              </div>

              {/* Arrow */}
              <div className="hidden md:flex justify-center text-zinc-700">
                <ArrowRight size={20} />
              </div>

              {/* Step 2 */}
              <div className="bg-[#18181B] border border-white/5 rounded-2xl p-5 text-center space-y-2 hover:border-white/10 transition-all duration-300">
                <span className="text-xs font-bold text-rose-400">02</span>
                <h4 className="font-bold text-sm text-zinc-100">1500 Photos</h4>
                <p className="text-xs text-zinc-400">One person has all the raw photos.</p>
              </div>

              {/* Arrow */}
              <div className="hidden md:flex justify-center text-zinc-700">
                <ArrowRight size={20} />
              </div>

              {/* Step 3 */}
              <div className="bg-[#18181B] border border-white/5 rounded-2xl p-5 text-center space-y-2 hover:border-white/10 transition-all duration-300">
                <span className="text-xs font-bold text-rose-400">03</span>
                <h4 className="font-bold text-sm text-zinc-100">The Flooding</h4>
                <p className="text-xs text-zinc-400">Everyone messages: &ldquo;Send photos!&rdquo;</p>
              </div>

              {/* Arrow */}
              <div className="hidden md:flex justify-center text-zinc-700">
                <ArrowRight size={20} />
              </div>

              {/* Step 4 */}
              <div className="bg-[#18181B] border border-white/5 rounded-2xl p-5 text-center space-y-2 hover:border-white/10 transition-all duration-300">
                <span className="text-xs font-bold text-rose-400">04</span>
                <h4 className="font-bold text-sm text-zinc-100">Wrong Pictures</h4>
                <p className="text-xs text-zinc-400">Hours spent sorting, wrong files sent.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Meet PhotoShare AI */}
        <section className="px-6 py-20 max-w-7xl mx-auto w-full">
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#6366F1]">How It Works</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-[#FAFAFA]">Meet PhotoShare AI</p>
            <p className="text-[#A1A1AA] max-w-xl mx-auto text-sm">Three simple steps to unlock your memories without sorting.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step Card 1 */}
            <div className="bg-[#18181B] border border-white/5 rounded-2xl p-8 hover:border-[#6366F1]/30 transition-all duration-300 relative group overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#6366F1]/5 rounded-bl-full filter blur-xl transition-all duration-300 group-hover:scale-150" />
              <div className="h-12 w-12 rounded-xl bg-[#6366F1]/10 flex items-center justify-center text-[#6366F1] mb-6">
                <Upload size={22} />
              </div>
              <h4 className="text-lg font-bold text-zinc-100 mb-2">1. Upload Event Photos</h4>
              <p className="text-sm text-[#A1A1AA]">
                Create an event and upload all raw pictures. Host receives a secure shareable link for event guests.
              </p>
            </div>

            {/* Step Card 2 */}
            <div className="bg-[#18181B] border border-white/5 rounded-2xl p-8 hover:border-[#6366F1]/30 transition-all duration-300 relative group overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#6366F1]/5 rounded-bl-full filter blur-xl transition-all duration-300 group-hover:scale-150" />
              <div className="h-12 w-12 rounded-xl bg-[#6366F1]/10 flex items-center justify-center text-[#6366F1] mb-6">
                <Camera size={22} />
              </div>
              <h4 className="text-lg font-bold text-zinc-100 mb-2">2. Upload One Selfie</h4>
              <p className="text-sm text-[#A1A1AA]">
                Guests open the link, click snap, and upload a single selfie to generate their facial vector model.
              </p>
            </div>

            {/* Step Card 3 */}
            <div className="bg-[#18181B] border border-white/5 rounded-2xl p-8 hover:border-[#6366F1]/30 transition-all duration-300 relative group overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#6366F1]/5 rounded-bl-full filter blur-xl transition-all duration-300 group-hover:scale-150" />
              <div className="h-12 w-12 rounded-xl bg-[#6366F1]/10 flex items-center justify-center text-[#6366F1] mb-6">
                <Download size={22} />
              </div>
              <h4 className="text-lg font-bold text-zinc-100 mb-2">3. Download Your Gallery</h4>
              <p className="text-sm text-[#A1A1AA]">
                AI instantly matches you across all event photos and unlocks your personalized, downloadable album.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Privacy Model (MOST IMPORTANT SECTION) */}
        <section className="px-6 py-20 bg-zinc-950/40 border-y border-white/5 relative">
          <div className="absolute inset-0 bg-[#06B6D4]/2 rounded-full blur-[160px] pointer-events-none max-w-2xl mx-auto" />
          <div className="max-w-7xl mx-auto w-full flex flex-col items-center">
            <div className="text-center space-y-3 mb-16">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#06B6D4] flex items-center justify-center gap-1.5">
                <Shield size={16} /> Privacy-First Architecture
              </h2>
              <p className="text-3xl sm:text-4xl font-extrabold text-[#FAFAFA]">Your Photos Stay Yours.</p>
              <p className="text-[#A1A1AA] max-w-xl mx-auto text-sm">
                Unlike shared albums, and cloud folders, nobody can browse everyone else&apos;s photos.
              </p>
            </div>

            {/* Privacy Visualization Grid */}
            <div className="grid md:grid-cols-2 gap-12 max-w-5xl w-full items-center">
              
              {/* Left Column: Explainer */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="text-xl font-bold text-zinc-100">Private by Default</h4>
                  <p className="text-[#A1A1AA] text-sm leading-relaxed">
                    Only two types of photos are ever visible to a guest:
                  </p>
                  <ul className="space-y-3 text-sm text-zinc-300">
                    <li className="flex items-start gap-2.5">
                      <span className="h-5 w-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mt-0.5">✓</span>
                      <span>Photos they manually uploaded to the event.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="h-5 w-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mt-0.5">✓</span>
                      <span>Photos where our AI model finds their face.</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-[#06B6D4]/10 bg-[#06B6D4]/5 text-xs text-cyan-200 leading-relaxed flex gap-2">
                  <Lock size={20} className="shrink-0 text-cyan-400 mt-0.5" />
                  <div>
                    <span className="font-bold">Even the event host is locked out:</span> Hosts can manage the event and upload photos, but they cannot browse through individual guests&apos; secure personal matching galleries.
                  </div>
                </div>
              </div>

              {/* Right Column: Visual Diagram */}
              <div className="bg-[#18181B] border border-white/5 rounded-3xl p-6 relative overflow-hidden space-y-6">
                {/* Central Event Album representation */}
                <div className="flex flex-col items-center pb-6 border-b border-white/5">
                  <div className="h-10 w-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-300 mb-2 border border-white/5 shadow-inner">
                    <Users size={20} />
                  </div>
                  <span className="text-xs font-bold text-zinc-200">Central Event Album (1,500 Photos)</span>
                  <span className="text-[10px] text-zinc-500">Host uploads raw files</span>
                </div>

                {/* Simulated Private Paths */}
                <div className="space-y-4">
                  {/* User A */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/50 border border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-indigo-500/10 border border-[#6366F1]/30 flex items-center justify-center font-bold text-xs text-indigo-400">A</div>
                      <div>
                        <span className="text-xs font-semibold text-zinc-200">Akash&apos;s Gallery</span>
                        <p className="text-[9px] text-zinc-500">Only matches containing Akash&apos;s face</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <Lock size={10} /> Unlocked
                    </span>
                  </div>

                  {/* User B (Locked / Blurred to Akash) */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/20 border border-dashed border-white/5 select-none opacity-50">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xs text-zinc-500">B</div>
                      <div>
                        <span className="text-xs font-semibold text-zinc-400 blur-[2px]">Rahul&apos;s Gallery</span>
                        <p className="text-[9px] text-zinc-600">Rahul&apos;s private matches</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-rose-500 font-bold bg-rose-500/10 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <EyeOff size={10} /> Restricted
                    </span>
                  </div>

                  {/* User C (Locked / Blurred to Akash) */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/20 border border-dashed border-white/5 select-none opacity-50">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xs text-zinc-500">C</div>
                      <div>
                        <span className="text-xs font-semibold text-zinc-400 blur-[2px]">Ankita&apos;s Gallery</span>
                        <p className="text-[9px] text-zinc-600">Ankita&apos;s private matches</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-rose-500 font-bold bg-rose-500/10 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <EyeOff size={10} /> Restricted
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Section 5: Benefits Grid */}
        <section className="px-6 py-20 max-w-7xl mx-auto w-full">
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#6366F1]">The Experience</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-[#FAFAFA]">Designed for Seamless Sharing</p>
            <p className="text-[#A1A1AA] max-w-xl mx-auto text-sm">Focusing purely on what makes your life easier after a great event.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Benefit Card 1 */}
            <div className="bg-[#18181B] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all duration-300">
              <h4 className="font-bold text-zinc-100 mb-2">No Endless WhatsApp Messages</h4>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                Say goodbye to group chat floods of &ldquo;Who has my photo? Send it to me!&rdquo; Everyone retrieves their own.
              </p>
            </div>

            {/* Benefit Card 2 */}
            <div className="bg-[#18181B] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all duration-300">
              <h4 className="font-bold text-zinc-100 mb-2">No Manual Searching</h4>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                Photographers and hosts don&apos;t have to waste hours scanning and matching faces manually to send file groups.
              </p>
            </div>

            {/* Benefit Card 3 */}
            <div className="bg-[#18181B] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all duration-300">
              <h4 className="font-bold text-zinc-100 mb-2">Private By Design</h4>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                Each guest gets an exclusive locked view. No stranger or acquaintance can browse everyone else&apos;s photos.
              </p>
            </div>

            {/* Benefit Card 4 */}
            <div className="bg-[#18181B] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all duration-300">
              <h4 className="font-bold text-zinc-100 mb-2">Only Your Photos</h4>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                Your gallery contains exclusively photos of you. You don&apos;t have to browse through irrelevant images.
              </p>
            </div>

            {/* Benefit Card 5 */}
            <div className="bg-[#18181B] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all duration-300">
              <h4 className="font-bold text-zinc-100 mb-2">Instant AI Matching</h4>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                Face vector matching algorithms search through thousands of event photos in milliseconds.
              </p>
            </div>

            {/* Benefit Card 6 */}
            <div className="bg-[#18181B] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all duration-300">
              <h4 className="font-bold text-zinc-100 mb-2">One-Click Downloads</h4>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                Export and download all matching photos in full resolution at the press of a single button.
              </p>
            </div>
          </div>
        </section>

        {/* Section 6: Use Cases */}
        <section className="px-6 py-20 bg-zinc-950/40 border-y border-white/5">
          <div className="max-w-7xl mx-auto w-full">
            <div className="text-center space-y-3 mb-16">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#6366F1]">Where It Works</h2>
              <p className="text-3xl sm:text-4xl font-extrabold text-[#FAFAFA]">Designed for Any Occasion</p>
              <p className="text-[#A1A1AA] max-w-xl mx-auto text-sm">Perfect for host organizers, photographers, and group events.</p>
            </div>

            {/* Use Case Items */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-center">
              {[
                { title: 'Weddings', icon: '💍' },
                { title: 'College Festivals', icon: '🎸' },
                { title: 'Corporate Events', icon: '🏢' },
                { title: 'Hackathons', icon: '💻' },
                { title: 'Trips & Travel', icon: '✈️' },
                { title: 'Marathons', icon: '🏃' },
                { title: 'Convocations', icon: '🎓' },
                { title: 'Concerts', icon: '🎤' }
              ].map((item, i) => (
                <div key={i} className="bg-[#18181B] border border-white/5 rounded-xl p-6 hover:border-white/10 transition-all duration-300 flex flex-col items-center justify-center space-y-2">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-xs font-bold text-zinc-200">{item.title}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 7: Interactive Demo */}
        <section id="demo-section" className="px-6 py-20 max-w-7xl mx-auto w-full flex flex-col items-center">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-emerald-500">Live Simulation</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-[#FAFAFA]">Try the AI Matcher Demo</p>
            <p className="text-[#A1A1AA] max-w-xl mx-auto text-sm">Experience the scanning pipeline in real-time right here on the landing page.</p>
          </div>

          <div className="w-full max-w-2xl bg-[#18181B] border border-white/5 rounded-3xl p-8 relative overflow-hidden flex flex-col items-center min-h-[380px] justify-center">
            
            {/* IDLE state */}
            {demoState === 'idle' && (
              <div className="text-center space-y-5 animate-in fade-in duration-300 flex flex-col items-center">
                <div className="h-16 w-16 rounded-full bg-indigo-500/10 border border-[#6366F1]/30 flex items-center justify-center text-[#6366F1] shadow-inner">
                  <Upload size={24} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-zinc-100">Simulate Selfie Upload</h4>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto">We will upload a mock selfie to scan 1,347 event photos and isolate matches.</p>
                </div>
                <Button onClick={startDemo} className="bg-[#6366F1] hover:bg-[#6366F1]/90 text-white font-semibold">
                  Try Live Match
                </Button>
              </div>
            )}

            {/* UPLOADING state */}
            {demoState === 'uploading' && (
              <div className="text-center space-y-3 animate-in fade-in duration-300 flex flex-col items-center">
                <div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                <span className="text-xs font-bold text-zinc-300">Uploading selfie to serverless memory...</span>
              </div>
            )}

            {/* SCANNING state */}
            {demoState === 'scanning' && (
              <div className="text-center space-y-4 animate-in fade-in duration-300 flex flex-col items-center">
                <div className="h-40 w-40 rounded-2xl border border-white/10 overflow-hidden relative bg-zinc-900 shadow-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80" 
                    alt="Selfie demo" 
                    className="h-full w-full object-cover" 
                  />
                  <div className="absolute left-0 right-0 h-1 bg-indigo-500 shadow-[0_0_12px_2px_rgba(99,102,241,0.8)] animate-laser-scan" />
                </div>
                <span className="text-xs font-bold text-zinc-300 animate-pulse">Running face mesh scan...</span>
              </div>
            )}

            {/* SEARCHING state */}
            {demoState === 'searching' && (
              <div className="text-center space-y-3 animate-in fade-in duration-300 flex flex-col items-center">
                <div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                <div className="space-y-1">
                  <span className="text-xs font-mono text-zinc-300">Searching 1,347 photos...</span>
                  <p className="text-[10px] text-zinc-500">Matching {demoMatches} photos...</p>
                </div>
              </div>
            )}

            {/* RESULTS state */}
            {demoState === 'results' && (
              <div className="w-full space-y-6 animate-in fade-in duration-500 flex flex-col items-center">
                <div className="flex justify-between items-center w-full pb-4 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <Check size={10} /> Complete
                    </span>
                    <span className="text-xs font-bold text-zinc-300">Matched Album (126 matched files)</span>
                  </div>
                  <Button onClick={() => setDemoState('idle')} variant="ghost" className="text-xs text-zinc-400 hover:text-zinc-200">
                    Reset Demo
                  </Button>
                </div>

                {/* Match Gallery Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                  {MATCHED_IMAGES.map((img, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden border border-white/5 relative group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt="Matched pic" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border border-emerald-500 rounded shadow-[0_0_6px_rgba(34,197,94,0.5)]" />
                    </div>
                  ))}
                </div>

                <div className="w-full flex justify-center pt-2">
                  <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 h-10 shadow-lg shadow-emerald-600/20 flex items-center gap-1.5">
                    <Download size={16} /> Download All 126 Matches
                  </Button>
                </div>
              </div>
            )}

          </div>
        </section>

        {/* Section 8: Comparison */}
        <section className="px-6 py-20 bg-zinc-950/40 border-y border-white/5">
          <div className="max-w-4xl mx-auto w-full">
            <div className="text-center space-y-3 mb-16">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-rose-500">Comparison</h2>
              <p className="text-3xl sm:text-4xl font-extrabold text-[#FAFAFA]">Manual Sorting vs. PhotoShare AI</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Without */}
              <div className="bg-[#18181B]/40 border border-white/5 rounded-2xl p-6 space-y-4">
                <h4 className="font-bold text-rose-400 flex items-center gap-1.5 text-sm uppercase">
                  <EyeOff size={16} /> Without PhotoShare
                </h4>
                <ul className="space-y-3 text-xs text-zinc-400">
                  <li>• Asking friends in multiple WhatsApp groups</li>
                  <li>• Reviewing thousands of irrelevant files</li>
                  <li>• Receiving incorrect matches or missed memories</li>
                  <li>• Host spending hours manually selecting group files</li>
                  <li>• Public shared links exposing everyone&apos;s photos</li>
                </ul>
              </div>

              {/* With */}
              <div className="bg-[#18181B] border border-emerald-500/20 rounded-2xl p-6 space-y-4 shadow-lg shadow-emerald-500/5">
                <h4 className="font-bold text-emerald-400 flex items-center gap-1.5 text-sm uppercase">
                  <Check size={16} /> With PhotoShare
                </h4>
                <ul className="space-y-3 text-xs text-zinc-200">
                  <li>• Upload all photos once</li>
                  <li>• Upload a single selfie</li>
                  <li>• Instantly receive only your pictures</li>
                  <li>• 100% private: no shared folder access leaks</li>
                  <li>• Download everything in full resolution</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Section 9: Trust & Stats */}
        <section className="px-6 py-20 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-center">
            <div className="bg-[#18181B] border border-white/5 rounded-2xl p-6">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#FAFAFA]">100%</span>
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider mt-1">Private Galleries</p>
            </div>
            <div className="bg-[#18181B] border border-white/5 rounded-2xl p-6">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#FAFAFA]">0s</span>
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider mt-1">Manual Searching</p>
            </div>
            <div className="bg-[#18181B] border border-white/5 rounded-2xl p-6">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#FAFAFA]">10k+</span>
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider mt-1">Photos Scanned</p>
            </div>
            <div className="bg-[#18181B] border border-white/5 rounded-2xl p-6">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#FAFAFA]">1s</span>
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider mt-1">Face Recognition</p>
            </div>
          </div>
        </section>

        {/* Section 10: Final CTA */}
        <section className="px-6 py-24 bg-gradient-to-b from-zinc-950 to-[#09090B] border-t border-white/5 text-center relative overflow-hidden flex flex-col items-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#6366F1]/5 rounded-full filter blur-[100px] pointer-events-none" />
          <div className="max-w-2xl mx-auto space-y-6 relative z-10">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Never ask <br />
              <span className="text-[#6366F1]">&ldquo;Bro, send me my photos&rdquo;</span> again.
            </h2>
            <p className="text-sm text-[#A1A1AA] max-w-md mx-auto">
              Create your first secure photo-matching event today. Share the link, upload your selfie, and instantly receive your personal memories.
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <Link href="/auth/sign-up">
                <Button size="lg" className="bg-[#FAFAFA] text-[#09090B] hover:bg-white px-8 h-12 font-semibold">
                  Create Event
                </Button>
              </Link>
              <Link href="/auth/sign-in">
                <Button size="lg" variant="outline" className="border-white/10 hover:bg-white/5 px-8 h-12">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="h-16 border-t border-white/5 flex items-center justify-center text-[10px] text-zinc-600 bg-zinc-950 shrink-0">
        © 2026 PhotoShare AI. All rights reserved. Designed by DeepMind team.
      </footer>
    </div>
  );
}
