// app/page.tsx
// Storytelling landing page for PhotoShare AI (V2).
// Built with a premium dark theme, glassmorphism, typing animation headlines, split workflows, and interactive simulations.

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
  Check, 
  AlertCircle,
  EyeOff,
  QrCode,
  Share2,
  HelpCircle,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mock images representing incorrect matches for the chat simulator privacy warning
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
  // --- Typing Headline Animation State ---
  const headlines = [
    "The Fastest Way to Find Every Photo You're In.",
    "Your Memories. Your Gallery. Your Privacy.",
    "One Upload. Personalized Galleries For Every Guest.",
    "Turn One Event Album Into Thousands of Personal Galleries."
  ];
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const fullText = headlines[headlineIndex];
    
    if (isDeleting) {
      timer = setTimeout(() => {
        setCurrentText((prev) => prev.slice(0, -1));
      }, 25);
    } else {
      timer = setTimeout(() => {
        setCurrentText((prev) => fullText.slice(0, prev.length + 1));
      }, 50);
    }

    if (!isDeleting && currentText === fullText) {
      timer = setTimeout(() => setIsDeleting(true), 3200); // Hold full text
    } else if (isDeleting && currentText === '') {
      setIsDeleting(false);
      setHeadlineIndex((prev) => (prev + 1) % headlines.length);
    }

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, headlineIndex]);

  // --- Split Hero Workflows Sync State ---
  const [orgStep, setOrgStep] = useState(0);
  const [guestStep, setGuestStep] = useState(0);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [aiMatches, setAiMatches] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setOrgStep((prev) => {
        const next = (prev + 1) % 5;
        if (next === 0) {
          setUploadPercent(0);
          setProcessedCount(0);
        }
        return next;
      });
      setGuestStep((prev) => {
        const next = (prev + 1) % 5;
        if (next === 0) setAiMatches(0);
        return next;
      });
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Handle Organizer Upload simulation progress
  useEffect(() => {
    if (orgStep === 1) {
      const interval = setInterval(() => {
        setUploadPercent((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);
      return () => clearInterval(interval);
    }
  }, [orgStep]);

  // Handle Organizer AI processing count simulation
  useEffect(() => {
    if (orgStep === 2) {
      const interval = setInterval(() => {
        setProcessedCount((prev) => {
          if (prev >= 1200) {
            clearInterval(interval);
            return 1200;
          }
          return prev + 120;
        });
      }, 200);
      return () => clearInterval(interval);
    }
  }, [orgStep]);

  // Handle Guest AI matches count simulation
  useEffect(() => {
    if (guestStep === 2) {
      const interval = setInterval(() => {
        setAiMatches((prev) => {
          if (prev >= 126) {
            clearInterval(interval);
            return 126;
          }
          return prev + 14;
        });
      }, 150);
      return () => clearInterval(interval);
    }
  }, [guestStep]);

  // --- V2 Chat Simulator State ---
  const [chatStep, setChatStep] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setChatStep((prev) => (prev + 1) % 9);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  // --- Interactive Demo State ---
  const [demoState, setDemoState] = useState<'idle' | 'uploading' | 'scanning' | 'searching' | 'results'>('idle');
  const [demoMatches, setDemoMatches] = useState(0);

  const startDemo = () => {
    setDemoState('uploading');
    setDemoMatches(0);

    setTimeout(() => {
      setDemoState('scanning');
      setTimeout(() => {
        setDemoState('searching');
        let count = 0;
        const countInterval = setInterval(() => {
          count += 14;
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
      
      {/* Background glow meshes & noise */}
      <div className="absolute top-[-10%] left-[-15%] w-[60%] h-[60%] bg-[#6366F1]/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-15%] w-[65%] h-[65%] bg-[#06B6D4]/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[5%] left-[10%] w-[50%] h-[50%] bg-[#6366F1]/5 rounded-full blur-[130px] pointer-events-none" />
      {/* Soft noise texture overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#09090B_80%)] opacity-60 pointer-events-none" />

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
        <section className="relative px-6 max-w-7xl mx-auto w-full py-12 md:py-16 flex flex-col items-center">
          
          {/* Headline & Slogans */}
          <div className="text-center max-w-4xl space-y-6 mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/5 bg-[#18181B] text-xs font-semibold text-[#A1A1AA]">
              <Sparkles size={12} className="text-indigo-400" />
              Private Event Matching Engine
            </div>

            {/* Dynamic Typing Title */}
            <div className="min-h-[140px] flex items-center justify-center">
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight max-w-3xl">
                {currentText}
                <span className="inline-block w-1.5 h-10 ml-1 bg-[#6366F1] animate-cursor-pulse align-middle" />
              </h1>
            </div>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#A1A1AA] max-w-3xl mx-auto font-normal leading-relaxed">
              Upload event photos once. Guests simply scan a QR code or open a shared event link, upload one selfie, and instantly receive only the photos they&apos;re in. No manual searching. No shared album chaos. No privacy concerns.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
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

          {/* Split Hero Workflows: Organizer vs Guest */}
          <div className="relative grid md:grid-cols-2 gap-16 max-w-5xl w-full items-stretch pt-8">
            
            {/* SVG Connection Path (Desktop only) */}
            <div className="hidden md:block absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-12 z-10 pointer-events-none">
              <svg className="w-full h-full" fill="none" viewBox="0 0 100 50">
                <path d="M10,25 Q50,0 90,25" stroke="#6366F1" strokeWidth="2" fill="none" className="animate-dash-line" />
                <path d="M10,25 Q50,50 90,25" stroke="#06B6D4" strokeWidth="2" fill="none" className="animate-dash-line" style={{ animationDelay: '1s' }} />
              </svg>
            </div>

            {/* LEFT COLUMN: Organizer Workflow */}
            <div className="flex flex-col items-center">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6366F1] mb-4 flex items-center gap-1.5 bg-[#6366F1]/5 px-3 py-1 rounded-full border border-[#6366F1]/10">
                Organizer / Photographer Workflow
              </h3>

              <div className="w-full max-w-sm aspect-[9/16] rounded-[40px] border-[6px] border-zinc-800 bg-[#18181B] p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between">
                {/* Phone Speaker */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-28 bg-zinc-800 rounded-b-xl flex items-center justify-center z-20">
                  <div className="w-10 h-1 bg-zinc-900 rounded-full" />
                </div>

                {/* Header */}
                <div className="flex items-center gap-1.5 pt-4 pb-3 border-b border-white/5">
                  <div className="h-6 w-6 rounded-md bg-[#6366F1] flex items-center justify-center text-white">
                    <Camera size={12} />
                  </div>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-300">PhotoShare Host</span>
                </div>

                {/* Workflow Simulation Grid */}
                <div className="flex-1 flex flex-col justify-center space-y-4">
                  {/* Step 0: Create Event */}
                  {orgStep === 0 && (
                    <div className="space-y-3 animate-in fade-in duration-300">
                      <div className="text-center space-y-1">
                        <span className="text-[10px] font-bold text-[#6366F1] uppercase">Step 1</span>
                        <h4 className="text-xs font-bold text-zinc-100">Create Event Workspace</h4>
                      </div>
                      <div className="p-3 rounded-xl bg-zinc-900/80 border border-white/5 space-y-2">
                        <span className="text-[9px] text-zinc-500">Event Title</span>
                        <div className="h-7 rounded border border-white/10 bg-zinc-950 px-2 flex items-center text-[10px] text-zinc-300">
                          Wedding Gala 2026
                        </div>
                        <div className="h-7 rounded bg-[#6366F1] flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                          Create Event
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 1: Uploading Photos */}
                  {orgStep === 1 && (
                    <div className="space-y-3 animate-in fade-in duration-300">
                      <div className="text-center space-y-1">
                        <span className="text-[10px] font-bold text-[#6366F1] uppercase">Step 2</span>
                        <h4 className="text-xs font-bold text-zinc-100">Uploading Raw Gallery</h4>
                      </div>
                      <div className="p-4 rounded-xl bg-zinc-900/80 border border-white/5 space-y-3">
                        <div className="flex justify-between items-center text-[9px] text-zinc-400">
                          <span>Uploading 1,200 photos...</span>
                          <span className="font-bold">{uploadPercent}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden">
                          <div className="h-full bg-[#6366F1] rounded-full transition-all duration-300" style={{ width: `${uploadPercent}%` }} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: AI Processing */}
                  {orgStep === 2 && (
                    <div className="space-y-3 animate-in fade-in duration-300">
                      <div className="text-center space-y-1">
                        <span className="text-[10px] font-bold text-[#6366F1] uppercase">Step 3</span>
                        <h4 className="text-xs font-bold text-zinc-100">AI Scanning Embeddings</h4>
                      </div>
                      <div className="p-4 rounded-xl bg-zinc-900/80 border border-white/5 flex flex-col items-center space-y-2">
                        <div className="h-8 w-8 rounded-full border border-indigo-500/20 border-t-indigo-500 animate-spin flex items-center justify-center">
                          <Search size={14} className="text-[#6366F1]" />
                        </div>
                        <span className="text-[10px] font-mono text-zinc-300">Processed: {processedCount} / 1200</span>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Event Link / QR Code */}
                  {orgStep === 3 && (
                    <div className="space-y-3 animate-in fade-in duration-300 flex flex-col items-center">
                      <div className="text-center space-y-1">
                        <span className="text-[10px] font-bold text-[#6366F1] uppercase">Step 4</span>
                        <h4 className="text-xs font-bold text-zinc-100">Generate QR & Link</h4>
                      </div>
                      <div className="p-3 rounded-xl bg-white text-black flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                        <QrCode size={70} />
                      </div>
                      <span className="text-[8px] text-zinc-500">Unique event QR generated</span>
                    </div>
                  )}

                  {/* Step 4: Share */}
                  {orgStep === 4 && (
                    <div className="space-y-3 animate-in fade-in duration-300">
                      <div className="text-center space-y-1">
                        <span className="text-[10px] font-bold text-[#6366F1] uppercase">Step 5</span>
                        <h4 className="text-xs font-bold text-zinc-100">Share with Guests</h4>
                      </div>
                      <div className="p-3 rounded-xl bg-zinc-900/80 border border-white/5 space-y-2 flex flex-col items-center">
                        <Share2 size={24} className="text-[#6366F1] animate-bounce" />
                        <span className="text-[9px] text-zinc-400 text-center">Event live! Ready to deliver custom matches.</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer indicator */}
                <div className="flex justify-center gap-1.5 pb-2">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className={`h-1 w-4 rounded-full transition-all duration-300 ${orgStep === i ? 'bg-[#6366F1]' : 'bg-zinc-800'}`} />
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Guest Workflow */}
            <div className="flex flex-col items-center">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#06B6D4] mb-4 flex items-center gap-1.5 bg-[#06B6D4]/5 px-3 py-1 rounded-full border border-[#06B6D4]/10">
                Guest / Participant Workflow
              </h3>

              <div className="w-full max-w-sm aspect-[9/16] rounded-[40px] border-[6px] border-zinc-800 bg-[#18181B] p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between">
                {/* Phone Speaker */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-28 bg-zinc-800 rounded-b-xl flex items-center justify-center z-20">
                  <div className="w-10 h-1 bg-zinc-900 rounded-full" />
                </div>

                {/* Header */}
                <div className="flex items-center gap-1.5 pt-4 pb-3 border-b border-white/5">
                  <div className="h-6 w-6 rounded-md bg-[#06B6D4] flex items-center justify-center text-zinc-950">
                    <Lock size={12} />
                  </div>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-300">PhotoShare Guest</span>
                </div>

                {/* Workflow Simulation Grid */}
                <div className="flex-1 flex flex-col justify-center space-y-4">
                  {/* Step 0: Scan QR */}
                  {guestStep === 0 && (
                    <div className="space-y-3 animate-in fade-in duration-300 flex flex-col items-center">
                      <div className="text-center space-y-1">
                        <span className="text-[10px] font-bold text-[#06B6D4] uppercase">Step 1</span>
                        <h4 className="text-xs font-bold text-zinc-100">Scan QR Code</h4>
                      </div>
                      <div className="h-20 w-20 rounded-xl border border-[#06B6D4]/30 bg-zinc-900 flex items-center justify-center relative">
                        <QrCode size={40} className="text-[#06B6D4] animate-pulse" />
                        <div className="absolute inset-0 border-2 border-[#06B6D4] rounded-xl animate-ping" style={{ animationDuration: '3s' }} />
                      </div>
                    </div>
                  )}

                  {/* Step 1: Upload Selfie / Scanning */}
                  {guestStep === 1 && (
                    <div className="space-y-3 animate-in fade-in duration-300 flex flex-col items-center">
                      <div className="text-center space-y-1">
                        <span className="text-[10px] font-bold text-[#06B6D4] uppercase">Step 2</span>
                        <h4 className="text-xs font-bold text-zinc-100">Scanning Your Selfie</h4>
                      </div>
                      <div className="h-28 w-28 rounded-xl border border-white/10 overflow-hidden relative bg-zinc-950">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80" alt="Selfie" className="h-full w-full object-cover" />
                        <div className="absolute left-0 right-0 h-0.5 bg-[#06B6D4] shadow-[0_0_10px_2px_rgba(6,182,212,0.6)] animate-laser-scan" />
                      </div>
                    </div>
                  )}

                  {/* Step 2: AI Matching */}
                  {guestStep === 2 && (
                    <div className="space-y-3 animate-in fade-in duration-300 flex flex-col items-center">
                      <div className="text-center space-y-1">
                        <span className="text-[10px] font-bold text-[#06B6D4] uppercase">Step 3</span>
                        <h4 className="text-xs font-bold text-zinc-100">Matching Embeddings</h4>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 animate-pulse-ring">
                        <Sparkles size={20} />
                      </div>
                      <span className="text-xs font-extrabold text-zinc-200">Found {aiMatches} Matches</span>
                    </div>
                  )}

                  {/* Step 3: Private Gallery */}
                  {guestStep === 3 && (
                    <div className="space-y-2 animate-in fade-in duration-300">
                      <div className="text-center space-y-1">
                        <span className="text-[10px] font-bold text-[#06B6D4] uppercase">Step 4</span>
                        <h4 className="text-xs font-bold text-zinc-100">Private Gallery Ready</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-1 max-w-[200px] mx-auto">
                        {MATCHED_IMAGES.slice(0, 2).map((img, i) => (
                          <div key={i} className="aspect-square rounded-lg overflow-hidden border border-white/5 relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={img} alt="Matched pic" className="h-full w-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 4: Download */}
                  {guestStep === 4 && (
                    <div className="space-y-3 animate-in fade-in duration-300 flex flex-col items-center">
                      <div className="text-center space-y-1">
                        <span className="text-[10px] font-bold text-[#06B6D4] uppercase">Step 5</span>
                        <h4 className="text-xs font-bold text-zinc-100">Download Gallery</h4>
                      </div>
                      <div className="w-28 bg-[#06B6D4] text-zinc-950 rounded-lg h-7 flex items-center justify-center gap-1 text-[10px] font-bold shadow-md shadow-[#06B6D4]/20 animate-bounce">
                        <Download size={10} />
                        Get All Photos
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer indicator */}
                <div className="flex justify-center gap-1.5 pb-2">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className={`h-1 w-4 rounded-full transition-all duration-300 ${guestStep === i ? 'bg-[#06B6D4]' : 'bg-zinc-800'}`} />
                  ))}
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Section 1.5: Tri-Card strip below Hero */}
        <section className="px-6 py-12 max-w-6xl mx-auto w-full">
          <div className="grid md:grid-cols-3 gap-6">
            
            {/* Card 1: Problem */}
            <div className="bg-[#18181B] border border-white/5 rounded-2xl p-6 hover:border-rose-500/20 transition-all duration-300 flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <AlertCircle size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-zinc-100">Too Many Event Photos</h4>
                <p className="text-xs text-[#A1A1AA] leading-relaxed">
                  1,500+ photos in a shared link. Nobody wants to manually sort through everyone else&apos;s memories to locate their own.
                </p>
              </div>
            </div>

            {/* Card 2: Solution */}
            <div className="bg-[#18181B] border border-white/5 rounded-2xl p-6 hover:border-[#6366F1]/20 transition-all duration-300 flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-[#6366F1]/10 border border-[#6366F1]/30 flex items-center justify-center text-[#6366F1] shrink-0">
                <Sparkles size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-zinc-100">AI Finds Yours Instantly</h4>
                <p className="text-xs text-[#A1A1AA] leading-relaxed">
                  One selfie is all it takes. Face-matching vector models scan files and return only your images.
                </p>
              </div>
            </div>

            {/* Card 3: Trust */}
            <div className="bg-[#18181B] border border-white/5 rounded-2xl p-6 hover:border-[#06B6D4]/20 transition-all duration-300 flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-[#06B6D4]/10 border border-[#06B6D4]/30 flex items-center justify-center text-[#06B6D4] shrink-0">
                <Lock size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-zinc-100">Only You Can See Them</h4>
                <p className="text-xs text-[#A1A1AA] leading-relaxed">
                  Privacy is default. Other guests cannot browse your pictures, and hosts cannot access your personal gallery.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* Section 2: Chat Simulator & Warning Popup */}
        <section className="px-6 py-20 bg-zinc-950/40 border-y border-white/5 relative">
          <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center">
            
            {/* Left side: Explainer */}
            <div className="space-y-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-rose-500">The Privacy Mismatch</h2>
              <p className="text-3xl sm:text-4xl font-extrabold text-[#FAFAFA]">Shared Albums Expose Your Private Moments.</p>
              <p className="text-[#A1A1AA] text-sm leading-relaxed">
                When you share a cloud folder or standard photo link, you force a compromise. To let everyone find their photos, you expose **everything** to **everyone**. Unwanted frames, private angles, and personal memories are visible to all event attendees.
              </p>
            </div>

            {/* Right side: Chat & Warning Popup Simulator */}
            <div className="w-full max-w-md bg-[#18181B] border border-white/5 rounded-3xl p-6 relative overflow-hidden min-h-[380px] flex flex-col justify-between">
              
              {/* Chat Simulation */}
              <div className="space-y-3 text-xs flex-1">
                {/* Chat Akash */}
                {chatStep >= 0 && (
                  <div className="flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-[#6366F1]/20 text-indigo-200 rounded-2xl rounded-tr-none px-3 py-1.5 max-w-[80%]">
                      Can you send me my photos?
                    </div>
                  </div>
                )}

                {/* Chat Rahul 1 */}
                {chatStep >= 1 && (
                  <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-zinc-900 text-zinc-200 rounded-2xl rounded-tl-none px-3 py-1.5 max-w-[80%]">
                      Sure. But there are over 1200 event photos 😅
                    </div>
                  </div>
                )}

                {/* Chat Rahul 2 */}
                {chatStep >= 2 && (
                  <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-zinc-900 text-zinc-200 rounded-2xl rounded-tl-none px-3 py-1.5 max-w-[80%]">
                      Finding only your photos will take a while.
                    </div>
                  </div>
                )}

                {/* Chat Rahul 3 */}
                {chatStep >= 3 && (
                  <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-zinc-900 text-zinc-200 rounded-2xl rounded-tl-none px-3 py-1.5 max-w-[80%]">
                      Should I just send all of them?
                    </div>
                  </div>
                )}

                {/* Chat Akash 2 */}
                {chatStep >= 4 && (
                  <div className="flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-[#6366F1]/20 text-indigo-200 rounded-2xl rounded-tr-none px-3 py-1.5 max-w-[80%]">
                      That works... but then I&apos;ll have to search through everything myself 😭
                    </div>
                  </div>
                )}

                {/* Chat Rahul 4 */}
                {chatStep >= 5 && (
                  <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-zinc-900 text-zinc-200 rounded-2xl rounded-tl-none px-3 py-1.5 max-w-[80%]">
                      Exactly. Everyone is asking for their photos.
                    </div>
                  </div>
                )}
              </div>

              {/* Warning Popup Overlay */}
              {chatStep >= 6 && chatStep <= 7 && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
                  <div className="bg-[#18181B] border border-amber-500/30 rounded-2xl p-5 space-y-4 max-w-sm text-center shadow-2xl relative">
                    <div className="h-10 w-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mx-auto animate-bounce">
                      <AlertTriangle size={20} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-wide">Shared Album Created</h4>
                      <p className="text-[10px] text-zinc-400">Everyone can now browse and see:</p>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[9px] text-rose-300 text-left bg-zinc-900/50 p-2.5 rounded-lg border border-white/5">
                      <span>• Your Photos</span>
                      <span>• Unwanted Photos</span>
                      <span>• Private Moments</span>
                      <span>• Other People&apos;s Files</span>
                    </div>
                    <span className="text-[8px] text-zinc-500 font-semibold flex items-center justify-center gap-0.5">
                      <EyeOff size={10} /> Serious Privacy Risk
                    </span>
                  </div>
                </div>
              )}

              {/* Success PhotoShare AI transition */}
              {chatStep === 8 && (
                <div className="absolute inset-0 bg-[#09090B] flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in duration-500">
                  <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 animate-pulse-ring">
                    <ShieldCheck size={24} />
                  </div>
                  <h4 className="text-sm font-bold text-zinc-100 mb-1">PhotoShare AI Solves This</h4>
                  <p className="text-[10px] text-zinc-400 text-center max-w-[200px]">
                    Everyone receives **only** their own matching photos. Privacy stays 100% protected.
                  </p>
                </div>
              )}

            </div>
          </div>
        </section>

        {/* Section 4: Privacy Comparison */}
        <section className="px-6 py-20 max-w-7xl mx-auto w-full">
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#06B6D4]">The Comparison</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-[#FAFAFA]">Privacy Breakdown</p>
            <p className="text-[#A1A1AA] max-w-xl mx-auto text-sm">Visualizing the flow of files across shared folders vs. PhotoShare.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto items-stretch">
            
            {/* Left: Traditional Shared Album */}
            <div className="bg-[#18181B]/40 border border-white/5 rounded-3xl p-6 flex flex-col justify-between opacity-70">
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-rose-400 flex items-center gap-1.5 uppercase">
                  <AlertCircle size={16} /> Traditional Shared Album
                </h4>
                <p className="text-xs text-zinc-400">
                  Host uploads everything to a central directory. Anyone with the URL can view, save, and download everyone else&apos;s files.
                </p>
              </div>

              {/* Diagram */}
              <div className="bg-zinc-950 rounded-2xl p-4 mt-6 border border-white/5 space-y-4 text-center">
                <span className="text-[10px] text-zinc-500 uppercase font-mono">Everything Visible to All</span>
                <div className="flex justify-around items-center pt-2">
                  <div className="text-[10px] bg-zinc-900 border border-white/5 p-2 rounded-xl text-zinc-400">
                    Host Uploads
                  </div>
                  <div className="text-zinc-600">→</div>
                  <div className="text-[10px] bg-rose-500/10 border border-rose-500/20 p-2 rounded-xl text-rose-300 font-bold">
                    All 1,200 Photos Public ❌
                  </div>
                </div>
              </div>
            </div>

            {/* Right: PhotoShare AI */}
            <div className="bg-[#18181B] border border-[#06B6D4]/20 rounded-3xl p-6 flex flex-col justify-between shadow-lg shadow-[#06B6D4]/5">
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-[#06B6D4] flex items-center gap-1.5 uppercase">
                  <ShieldCheck size={16} /> PhotoShare AI Secure Flow
                </h4>
                <p className="text-xs text-zinc-300">
                  AI scans the uploads. Guests submit a selfie which acts as a decryption key to unlock only matching files.
                </p>
              </div>

              {/* Diagram */}
              <div className="bg-zinc-950 rounded-2xl p-4 mt-6 border border-white/5 space-y-4">
                <div className="flex justify-between items-center text-[9px] text-zinc-500 uppercase font-mono px-1">
                  <span>Secure Segmented Output</span>
                  <span className="text-emerald-400 font-bold">🔒 Encrypted</span>
                </div>
                
                <div className="space-y-2 text-[10px]">
                  <div className="flex justify-between items-center bg-zinc-900/50 p-2 rounded-lg border border-white/5">
                    <span className="text-zinc-300">Guest A Selfie</span>
                    <span className="text-emerald-400 font-bold">Unlocks A&apos;s Photos Only</span>
                  </div>
                  <div className="flex justify-between items-center bg-zinc-900/50 p-2 rounded-lg border border-white/5">
                    <span className="text-zinc-300">Guest B Selfie</span>
                    <span className="text-emerald-400 font-bold">Unlocks B&apos;s Photos Only</span>
                  </div>
                  <div className="flex justify-between items-center bg-zinc-900/20 p-2 rounded-lg border border-dashed border-white/5 select-none opacity-40">
                    <span className="text-zinc-600">Other Galleries</span>
                    <span className="text-rose-500 font-bold">Restricted</span>
                  </div>
                </div>
              </div>
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
                  <div className="absolute left-0 right-0 h-1 bg-[#06B6D4] shadow-[0_0_12px_2px_rgba(6,182,212,0.8)] animate-laser-scan" />
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

        {/* Section Final CTA */}
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
