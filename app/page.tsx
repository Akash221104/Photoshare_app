// app/page.tsx
// Storytelling landing page V3 (Refined).
// Built with a premium dark theme, flagship smartphone frames, sequential workflow animations, and live interactive simulators.

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
  Users, 
  Check, 
  AlertCircle,
  EyeOff,
  QrCode,
  Share2,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2
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
  // --- Headline Slider Transition State ---
  const headlines = [
    "The Fastest Way to Find Every Photo You're In.",
    "Your Memories. Your Gallery. Your Privacy.",
    "One Upload. Personalized Galleries For Every Guest.",
    "Turn One Event Album Into Thousands of Personal Galleries."
  ];
  const [headlineIndex, setHeadlineIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeadlineIndex((prev) => (prev + 1) % headlines.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [headlines.length]);

  // --- Master Sequenced Loop State (0 to 11) ---
  const [masterStep, setMasterStep] = useState(0);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [aiStep, setAiStep] = useState(0); // 0: detect, 1: match, 2: build

  useEffect(() => {
    const timer = setInterval(() => {
      setMasterStep((prev) => {
        const next = (prev + 1) % 12;
        if (next === 0) {
          setUploadPercent(0);
          setAiStep(0);
        }
        return next;
      });
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  // Sync upload progress during masterStep 1
  useEffect(() => {
    if (masterStep === 1) {
      setUploadPercent(0);
      const interval = setInterval(() => {
        setUploadPercent((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 20;
        });
      }, 150);
      return () => clearInterval(interval);
    }
  }, [masterStep]);

  // Sync AI scanning progress steps during masterStep 8, 9, 10
  useEffect(() => {
    if (masterStep === 8) setAiStep(0);
    if (masterStep === 9) setAiStep(1);
    if (masterStep === 10) setAiStep(2);
  }, [masterStep]);

  // --- WhatsApp-Style Chat Simulator State ---
  const [chatStep, setChatStep] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setChatStep((prev) => (prev + 1) % 8);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  // --- Interactive Demo State ---
  const [demoState, setDemoState] = useState<'idle' | 'uploading' | 'scanning' | 'searching' | 'results'>('idle');
  const [demoMatches, setDemoMatches] = useState(0);
  const [demoAiStep, setDemoAiStep] = useState(0); // 0: detect, 1: match, 2: build

  const startDemo = () => {
    setDemoState('uploading');
    setDemoMatches(0);
    setDemoAiStep(0);

    setTimeout(() => {
      setDemoState('scanning');
      setTimeout(() => {
        setDemoState('searching');
        let progress = 0;
        const interval = setInterval(() => {
          progress += 1;
          if (progress === 1) setDemoAiStep(1);
          if (progress === 2) setDemoAiStep(2);
          if (progress >= 3) {
            clearInterval(interval);
            setDemoMatches(126);
            setDemoState('results');
          }
        }, 1200);
      }, 2500);
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#09090B] text-[#FAFAFA] font-sans antialiased overflow-hidden selection:bg-[#6366F1]/30">
      
      {/* Background glow meshes & noise */}
      <div className="absolute top-[-10%] left-[-15%] w-[60%] h-[60%] bg-[#6366F1]/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-15%] w-[65%] h-[65%] bg-[#06B6D4]/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[5%] left-[10%] w-[50%] h-[50%] bg-[#6366F1]/5 rounded-full blur-[130px] pointer-events-none" />
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

            {/* Dynamic Sliding Title */}
            <div className="min-h-[120px] flex items-center justify-center overflow-hidden">
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight max-w-3xl bg-gradient-to-b from-[#FAFAFA] to-[#A1A1AA] bg-clip-text text-transparent transition-all duration-700 transform translate-y-0 scale-100">
                {headlines[headlineIndex]}
              </h1>
            </div>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#A1A1AA] max-w-3xl mx-auto font-normal leading-relaxed">
              Upload event photos once. Guests simply scan a QR code or open a shared event link, upload one selfie, and instantly receive only the photos they&apos;re in.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Link href="/auth/sign-up">
                <Button size="lg" className="bg-[#FAFAFA] text-[#09090B] hover:bg-[#FAFAFA]/95 px-8 h-12 shadow-lg transition-transform duration-300 hover:scale-[1.02] font-semibold">
                  Create Your First Event
                </Button>
              </Link>
              <a href="#demo-section">
                <Button size="lg" variant="outline" className="border-white/10 hover:bg-white/5 text-[#FAFAFA] px-8 h-12">
                  Watch 30-Second Demo
                </Button>
              </a>
            </div>
          </div>

          {/* Sequenced Hero Demos: Organizer vs Guest */}
          <div className="relative grid md:grid-cols-2 gap-16 max-w-5xl w-full items-stretch pt-8">
            
            {/* Flying QR Code overlay */}
            {masterStep === 4 && (
              <div className="absolute top-[40%] left-1/4 z-40 pointer-events-none animate-fly-qr bg-white p-2.5 rounded-2xl shadow-2xl flex items-center justify-center border border-zinc-200" style={{ '--fly-x': '340px', '--fly-y': '20px' } as React.CSSProperties}>
                <QrCode size={40} className="text-black" />
              </div>
            )}

            {/* LEFT SMARTPHONE: Organizer Phone */}
            <div className={`flex flex-col items-center transition-all duration-500 ${masterStep <= 4 ? 'opacity-100 scale-100' : 'opacity-40 scale-[0.98] grayscale'}`}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6366F1] mb-4 flex items-center gap-1.5 bg-[#6366F1]/5 px-3 py-1 rounded-full border border-[#6366F1]/10">
                Organizer Workflow
              </h3>

              {/* Smartphone mockup */}
              <div className={`w-full max-w-sm aspect-[9/16] rounded-[48px] border-[6px] p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between transition-all duration-500 bg-[#09090B] ${masterStep <= 4 ? 'border-[#6366F1] shadow-[#6366F1]/5' : 'border-zinc-800'}`}>
                {/* Dynamic Island Notch */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 h-6 w-32 bg-zinc-900 rounded-full flex items-center justify-center z-30 border border-white/5">
                  <div className="h-2 w-2 rounded-full bg-zinc-950 ml-2" />
                </div>
                {/* Diagonal Glass glare effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/2 to-transparent pointer-events-none z-20" />

                {/* Header */}
                <div className="flex items-center justify-between pt-6 pb-3 border-b border-white/5 z-10">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-400">PhotoShare Host</span>
                  <div className="h-2 w-2 rounded-full bg-[#6366F1] animate-pulse" />
                </div>

                {/* Simulated Operations */}
                <div className="flex-1 flex flex-col justify-center space-y-4 z-10">
                  {/* Step 0: Click Create Event */}
                  {masterStep === 0 && (
                    <div className="space-y-4 text-center animate-in fade-in duration-300">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-[#6366F1]">Step 1</span>
                        <h4 className="text-xs font-bold text-zinc-100">Setup Event Space</h4>
                      </div>
                      <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-3">
                        <div className="h-8 rounded bg-zinc-950 border border-white/10 px-2 flex items-center text-[10px] text-zinc-300">
                          Wedding Gala 2026
                        </div>
                        <div className="h-8 rounded-lg bg-[#6366F1] text-white flex items-center justify-center text-xs font-bold animate-button-press cursor-pointer">
                          Create Event
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 1: Uploading Photos */}
                  {masterStep === 1 && (
                    <div className="space-y-4 text-center animate-in fade-in duration-300">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-[#6366F1]">Step 2</span>
                        <h4 className="text-xs font-bold text-zinc-100">Uploading Gallery</h4>
                      </div>
                      <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-3">
                        <span className="text-[10px] text-zinc-400 font-semibold block animate-pulse">Uploading Photos...</span>
                        <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden">
                          <div className="h-full bg-[#6366F1] rounded-full transition-all duration-300" style={{ width: `${uploadPercent}%` }} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: AI Embedding */}
                  {masterStep === 2 && (
                    <div className="space-y-4 text-center animate-in fade-in duration-300">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-[#6366F1]">Step 3</span>
                        <h4 className="text-xs font-bold text-zinc-100">AI Organizing Faces</h4>
                      </div>
                      <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 flex flex-col items-center space-y-2">
                        <div className="h-7 w-7 rounded-full border border-indigo-500/30 border-t-indigo-500 animate-spin" />
                        <span className="text-[10px] text-zinc-300">1247 Photos Uploaded</span>
                        <span className="text-[9px] text-zinc-500">Mapping facial embeddings...</span>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Event Ready / QR Generation */}
                  {masterStep === 3 && (
                    <div className="space-y-4 text-center animate-in fade-in duration-300 flex flex-col items-center">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-[#6366F1]">Step 4</span>
                        <h4 className="text-xs font-bold text-zinc-100">Event Ready</h4>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2">
                        <CheckCircle2 size={20} className="animate-pulse" />
                      </div>
                      <div className="h-8 w-24 bg-zinc-900 border border-white/10 rounded-lg flex items-center justify-center text-[10px] text-zinc-300 font-bold animate-button-press cursor-pointer">
                        Share Event
                      </div>
                    </div>
                  )}

                  {/* Step 4: Flying QR */}
                  {masterStep === 4 && (
                    <div className="space-y-4 text-center animate-in fade-in duration-300 flex flex-col items-center">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-[#6366F1]">Step 5</span>
                        <h4 className="text-xs font-bold text-zinc-100">Fly QR to Guests</h4>
                      </div>
                      <div className="h-16 w-16 bg-zinc-800 border border-white/5 rounded-xl flex items-center justify-center opacity-30">
                        <QrCode size={36} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer bar */}
                <div className="h-1 w-24 bg-zinc-800 rounded-full mx-auto z-10" />
              </div>
            </div>

            {/* RIGHT SMARTPHONE: Guest Phone */}
            <div className={`flex flex-col items-center transition-all duration-500 ${masterStep >= 5 ? 'opacity-100 scale-100' : 'opacity-40 scale-[0.98] grayscale'}`}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#06B6D4] mb-4 flex items-center gap-1.5 bg-[#06B6D4]/5 px-3 py-1 rounded-full border border-[#06B6D4]/10">
                Guest Workflow
              </h3>

              {/* Smartphone mockup */}
              <div className={`w-full max-w-sm aspect-[9/16] rounded-[48px] border-[6px] p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between transition-all duration-500 bg-[#09090B] ${masterStep >= 5 ? 'border-[#06B6D4] shadow-[#06B6D4]/5' : 'border-zinc-800'}`}>
                {/* Dynamic Island Notch */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 h-6 w-32 bg-zinc-900 rounded-full flex items-center justify-center z-30 border border-white/5">
                  <div className="h-2 w-2 rounded-full bg-zinc-950 ml-2" />
                </div>
                {/* Diagonal Glass glare effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/2 to-transparent pointer-events-none z-20" />

                {/* Header */}
                <div className="flex items-center justify-between pt-6 pb-3 border-b border-white/5 z-10">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-400">PhotoShare Guest</span>
                  <div className="h-2 w-2 rounded-full bg-[#06B6D4] animate-pulse" />
                </div>

                {/* Simulated Operations */}
                <div className="flex-1 flex flex-col justify-center space-y-4 z-10">
                  {/* Step 5: Scan QR */}
                  {masterStep === 5 && (
                    <div className="space-y-4 text-center animate-in fade-in duration-300 flex flex-col items-center">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-[#06B6D4]">Step 1</span>
                        <h4 className="text-xs font-bold text-zinc-100">Scan QR Code</h4>
                      </div>
                      <div className="h-20 w-20 rounded-2xl border border-[#06B6D4]/30 bg-zinc-900 flex items-center justify-center relative">
                        <QrCode size={36} className="text-[#06B6D4]" />
                        <div className="absolute inset-0 border-2 border-[#06B6D4] rounded-2xl animate-ping" style={{ animationDuration: '3s' }} />
                      </div>
                    </div>
                  )}

                  {/* Step 6: Open Event */}
                  {masterStep === 6 && (
                    <div className="space-y-4 text-center animate-in fade-in duration-300">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-[#06B6D4]">Step 2</span>
                        <h4 className="text-xs font-bold text-zinc-100">Joined Event</h4>
                      </div>
                      <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-2">
                        <span className="text-[10px] text-zinc-300 font-bold block">Wedding Gala 2026</span>
                        <span className="text-[9px] text-zinc-500 block">Host: Rahul (1,247 photos)</span>
                      </div>
                    </div>
                  )}

                  {/* Step 7: Upload Selfie click */}
                  {masterStep === 7 && (
                    <div className="space-y-4 text-center animate-in fade-in duration-300 flex flex-col items-center">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-[#06B6D4]">Step 3</span>
                        <h4 className="text-xs font-bold text-zinc-100">Upload One Selfie</h4>
                      </div>
                      <div className="h-10 w-28 bg-[#06B6D4] text-zinc-950 rounded-lg flex items-center justify-center text-xs font-bold shadow-md shadow-[#06B6D4]/20 animate-button-press cursor-pointer">
                        Snap Selfie
                      </div>
                    </div>
                  )}

                  {/* Step 8, 9, 10: AI Progress bars */}
                  {(masterStep === 8 || masterStep === 9 || masterStep === 10) && (
                    <div className="space-y-4 text-center animate-in fade-in duration-300 flex flex-col items-center">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-[#06B6D4]">Step 4</span>
                        <h4 className="text-xs font-bold text-zinc-100">AI Processing</h4>
                      </div>
                      <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-2 w-full max-w-[220px] relative overflow-hidden">
                        {/* Laser Scan line on Face */}
                        <div className="h-12 w-12 rounded-full overflow-hidden border border-white/10 relative mx-auto mb-2 bg-zinc-800">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80" alt="Selfie preview" className="h-full w-full object-cover" />
                          <div className="absolute left-0 right-0 h-0.5 bg-[#06B6D4] shadow-[0_0_10px_1px_rgba(6,182,212,0.6)] animate-laser-scan" />
                        </div>
                        {aiStep === 0 && <span className="text-[9px] font-mono text-zinc-300 block">Detecting Faces [■■■■□□□□]</span>}
                        {aiStep === 1 && <span className="text-[9px] font-mono text-emerald-400 block animate-pulse">Matching Faces [■■■■■■■□]</span>}
                        {aiStep === 2 && <span className="text-[9px] font-mono text-emerald-400 font-bold block">Building Gallery [■■■■■■■■]</span>}
                      </div>
                    </div>
                  )}

                  {/* Step 11: Gallery Unlocked */}
                  {masterStep === 11 && (
                    <div className="flex-1 flex flex-col justify-between pt-2 animate-in fade-in duration-300">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                          <span className="text-[9px] font-semibold text-zinc-400">Personal Gallery (126 matches)</span>
                          <span className="text-[8px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <Lock size={8} /> Secure
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          {MATCHED_IMAGES.slice(0, 2).map((img, i) => (
                            <div key={i} className="aspect-square rounded-lg overflow-hidden border border-white/5 relative">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={img} alt="Matched pic" className="h-full w-full object-cover" />
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="w-full bg-[#06B6D4] text-zinc-950 rounded-lg h-7 flex items-center justify-center gap-1 text-[10px] font-bold mt-2 shadow-sm animate-button-press cursor-pointer">
                        <Download size={10} />
                        Download 126 Photos
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer bar */}
                <div className="h-1 w-24 bg-zinc-800 rounded-full mx-auto z-10" />
              </div>
            </div>

          </div>
        </section>

        {/* Section 1.3: Who Is This For? (Audience Grid) */}
        <section className="px-6 py-20 bg-zinc-950/40 border-y border-white/5">
          <div className="max-w-7xl mx-auto w-full">
            <div className="text-center space-y-3 mb-16">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#6366F1]">Who Is This For?</h2>
              <p className="text-3xl sm:text-4xl font-extrabold text-[#FAFAFA]">Designed for Every Occasion</p>
              <p className="text-[#A1A1AA] max-w-xl mx-auto text-sm">Empowering event managers, couples, organizations, and runners.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {/* Card 1: Weddings */}
              <div className="bg-[#18181B] border border-white/5 rounded-2xl p-6 hover:border-[#6366F1]/30 transition-all duration-300">
                <span className="text-2xl block mb-4">💍</span>
                <h4 className="font-bold text-zinc-100 mb-1">Wedding Photographers</h4>
                <p className="text-xs text-[#A1A1AA] leading-relaxed">
                  Upload the raw wedding album once. Every guest scans the card at the table and receives only their custom photos.
                </p>
              </div>

              {/* Card 2: Festivals */}
              <div className="bg-[#18181B] border border-white/5 rounded-2xl p-6 hover:border-[#6366F1]/30 transition-all duration-300">
                <span className="text-2xl block mb-4">🎸</span>
                <h4 className="font-bold text-zinc-100 mb-1">College Festivals</h4>
                <p className="text-xs text-[#A1A1AA] leading-relaxed">
                  Thousands of photos across bands, stages, and crowds. Zero manual sharing required; guests fetch theirs instantly.
                </p>
              </div>

              {/* Card 3: Corporate */}
              <div className="bg-[#18181B] border border-white/5 rounded-2xl p-6 hover:border-[#6366F1]/30 transition-all duration-300">
                <span className="text-2xl block mb-4">🏢</span>
                <h4 className="font-bold text-zinc-100 mb-1">Corporate Events</h4>
                <p className="text-xs text-[#A1A1AA] leading-relaxed">
                  Private team outings and retreats. Keeps company folders locked and matches team members with zero hassle.
                </p>
              </div>

              {/* Card 4: Marathons */}
              <div className="bg-[#18181B] border border-white/5 rounded-2xl p-6 hover:border-[#6366F1]/30 transition-all duration-300">
                <span className="text-2xl block mb-4">🏃</span>
                <h4 className="font-bold text-zinc-100 mb-1">Marathons</h4>
                <p className="text-xs text-[#A1A1AA] leading-relaxed">
                  Runners upload a selfie post-race and instantly locate all checkpoints and action shots containing their face.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 1.5: Privacy Comparison Section */}
        <section className="px-6 py-20 max-w-7xl mx-auto w-full">
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#06B6D4] flex items-center justify-center gap-1">
              <Shield size={14} /> The Privacy Comparison
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-[#FAFAFA]">Only You Can See Your Photos.</p>
            <p className="text-[#A1A1AA] max-w-xl mx-auto text-sm">
              Traditional shared albums expose everyone&apos;s memories. PhotoShare creates a private gallery for every guest.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto items-stretch">
            
            {/* Left: Traditional Shared Album */}
            <div className="bg-[#18181B]/40 border border-white/5 rounded-3xl p-8 flex flex-col justify-between opacity-80 hover:border-rose-500/20 transition-all duration-300">
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-rose-400 flex items-center gap-1.5 uppercase">
                  <AlertCircle size={16} /> Traditional Shared Album
                </h4>
                <p className="text-xs text-zinc-400">
                  Host uploads everything to a central directory (Google Drive/Dropbox). Anyone with the link can view, download, and browse everyone else&apos;s private moments.
                </p>
              </div>

              {/* Diagram */}
              <div className="bg-zinc-950 rounded-2xl p-4 mt-6 border border-white/5 space-y-4 text-center">
                <span className="text-[10px] text-zinc-500 uppercase font-mono">Everything Visible to All</span>
                <div className="flex justify-around items-center pt-2">
                  <div className="text-[10px] bg-zinc-900 border border-white/5 p-2.5 rounded-xl text-zinc-400">
                    Host Link
                  </div>
                  <div className="text-zinc-600">→</div>
                  <div className="text-[10px] bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl text-rose-300 font-bold">
                    All 1,200 Photos Public ❌
                  </div>
                </div>
              </div>
            </div>

            {/* Right: PhotoShare AI */}
            <div className="bg-[#18181B] border border-[#06B6D4]/20 rounded-3xl p-8 flex flex-col justify-between shadow-lg shadow-[#06B6D4]/5 hover:border-[#06B6D4]/40 transition-all duration-300">
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
                  <span className="text-emerald-400 font-bold">🔒 Private</span>
                </div>
                
                <div className="space-y-2 text-[10px]">
                  <div className="flex justify-between items-center bg-zinc-900/50 p-2.5 rounded-lg border border-white/5">
                    <span className="text-zinc-300">Guest A Selfie</span>
                    <span className="text-emerald-400 font-bold">A&apos;s Photos Only 🔒</span>
                  </div>
                  <div className="flex justify-between items-center bg-zinc-900/50 p-2.5 rounded-lg border border-white/5">
                    <span className="text-zinc-300">Guest B Selfie</span>
                    <span className="text-emerald-400 font-bold">B&apos;s Photos Only 🔒</span>
                  </div>
                  <div className="flex justify-between items-center bg-zinc-900/20 p-2.5 rounded-lg border border-dashed border-white/5 select-none opacity-40">
                    <span className="text-zinc-650">Host Dashboard</span>
                    <span className="text-[#06B6D4] font-bold">Manage Event Only</span>
                  </div>
                </div>
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
              
              {/* WhatsApp-Style Chat Simulation */}
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
                      I can... But I&apos;ll have to search through 1200 photos first.
                    </div>
                  </div>
                )}

                {/* Chat Rahul 2 */}
                {chatStep >= 2 && (
                  <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-zinc-900 text-zinc-200 rounded-2xl rounded-tl-none px-3 py-1.5 max-w-[80%]">
                      Or I can send everything.
                    </div>
                  </div>
                )}

                {/* Chat Akash 2 */}
                {chatStep >= 3 && (
                  <div className="flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-[#6366F1]/20 text-indigo-200 rounded-2xl rounded-tr-none px-3 py-1.5 max-w-[80%]">
                      Then I&apos;ll spend hours finding mine.
                    </div>
                  </div>
                )}

                {/* Chat Rahul 3 */}
                {chatStep >= 4 && (
                  <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-[#25D366]/20 text-emerald-200 rounded-2xl rounded-tl-none px-3 py-1.5 max-w-[80%] border border-[#25D366]/20">
                      I&apos;ll just share the whole album.
                    </div>
                  </div>
                )}
              </div>

              {/* Warning Popup Overlay */}
              {chatStep >= 5 && chatStep <= 6 && (
                <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
                  <div className="bg-[#18181B] border border-amber-500/30 rounded-2xl p-5 space-y-4 max-w-sm text-center shadow-2xl relative">
                    <div className="h-10 w-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mx-auto animate-bounce">
                      <AlertTriangle size={20} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-wide">Shared Album Created</h4>
                      <p className="text-[10px] text-zinc-400">1200 Photos Sent. Everyone can see:</p>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-[9px] text-rose-300 text-left bg-zinc-900/50 p-2.5 rounded-lg border border-white/5">
                      <span>• Your Photos</span>
                      <span>• Unwanted Photos</span>
                      <span>• Private Moments</span>
                      <span>• Other People&apos;s Photos</span>
                    </div>
                    <span className="text-[8px] text-zinc-500 font-semibold flex items-center justify-center gap-0.5">
                      <EyeOff size={10} /> Serious Privacy Risk
                    </span>
                  </div>
                </div>
              )}

              {/* Success PhotoShare AI transition */}
              {chatStep === 7 && (
                <div className="absolute inset-0 bg-[#09090B] flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in duration-500">
                  <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 animate-pulse-ring">
                    <ShieldCheck size={24} />
                  </div>
                  <h4 className="text-sm font-bold text-zinc-100 mb-1">PhotoShare AI Solution</h4>
                  <p className="text-[10px] text-zinc-400 text-center max-w-[200px] mb-2">
                    Private Gallery Created
                  </p>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    126 Photos Only For You
                  </span>
                </div>
              )}

            </div>
          </div>
        </section>

        {/* Section 4: Live Event Simulation (Progress Tracker timeline) */}
        <section id="demo-section" className="px-6 py-20 max-w-7xl mx-auto w-full flex flex-col items-center">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-emerald-500">Live Simulation</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-[#FAFAFA]">Live Event Simulation</p>
            <p className="text-[#A1A1AA] max-w-xl mx-auto text-sm">See how organizers and guests experience PhotoShare AI.</p>
          </div>

          {/* Timeline and Simulation panel */}
          <div className="grid md:grid-cols-3 gap-8 w-full max-w-5xl items-stretch">
            
            {/* Left: Progress Tracker timeline */}
            <div className="bg-[#18181B] border border-white/5 rounded-3xl p-6 flex flex-col justify-around space-y-4">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block px-1">Simulation Tracker</span>
              
              <div className="space-y-3 text-xs">
                {/* Step 1 */}
                <div className="flex items-center gap-2.5">
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center font-bold text-[10px] transition-all duration-300 ${demoState !== 'idle' ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400'}`}>
                    {demoState !== 'idle' ? '✔' : '1'}
                  </div>
                  <span className={demoState !== 'idle' ? 'text-emerald-400 font-semibold' : 'text-zinc-500'}>Upload Photos</span>
                </div>

                {/* Step 2 */}
                <div className="flex items-center gap-2.5">
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center font-bold text-[10px] transition-all duration-300 ${demoState !== 'idle' ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400'}`}>
                    {demoState !== 'idle' ? '✔' : '2'}
                  </div>
                  <span className={demoState !== 'idle' ? 'text-emerald-400 font-semibold' : 'text-zinc-500'}>Create Event</span>
                </div>

                {/* Step 3 */}
                <div className="flex items-center gap-2.5">
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center font-bold text-[10px] transition-all duration-300 ${demoState !== 'idle' ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400'}`}>
                    {demoState !== 'idle' ? '✔' : '3'}
                  </div>
                  <span className={demoState !== 'idle' ? 'text-emerald-400 font-semibold' : 'text-zinc-500'}>Share QR</span>
                </div>

                {/* Step 4 */}
                <div className="flex items-center gap-2.5">
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center font-bold text-[10px] transition-all duration-300 ${demoState === 'scanning' || demoState === 'searching' || demoState === 'results' ? 'bg-emerald-500 text-zinc-950 animate-pulse' : 'bg-zinc-800 text-zinc-400'}`}>
                    {demoState === 'scanning' || demoState === 'searching' || demoState === 'results' ? '✔' : '4'}
                  </div>
                  <span className={demoState === 'scanning' || demoState === 'searching' || demoState === 'results' ? 'text-[#06B6D4] font-semibold' : 'text-zinc-500'}>► Guest Joined</span>
                </div>

                {/* Step 5 */}
                <div className="flex items-center gap-2.5">
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center font-bold text-[10px] transition-all duration-300 ${demoState === 'scanning' ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400'}`}>
                    {demoState === 'scanning' ? '►' : '5'}
                  </div>
                  <span className={demoState === 'scanning' ? 'text-[#06B6D4] font-semibold animate-pulse' : 'text-zinc-500'}>Upload Selfie</span>
                </div>

                {/* Step 6 */}
                <div className="flex items-center gap-2.5">
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center font-bold text-[10px] transition-all duration-300 ${demoState === 'searching' ? 'bg-[#06B6D4] text-zinc-950 animate-pulse' : 'bg-zinc-800 text-zinc-400'}`}>
                    {demoState === 'searching' ? '►' : '6'}
                  </div>
                  <span className={demoState === 'searching' ? 'text-[#06B6D4] font-semibold' : 'text-zinc-500'}>AI Search</span>
                </div>

                {/* Step 7 */}
                <div className="flex items-center gap-2.5">
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center font-bold text-[10px] transition-all duration-300 ${demoState === 'results' ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400'}`}>
                    {demoState === 'results' ? '✔' : '7'}
                  </div>
                  <span className={demoState === 'results' ? 'text-emerald-400 font-semibold' : 'text-zinc-500'}>Gallery Ready</span>
                </div>
              </div>
            </div>

            {/* Right: Simulation interactive viewport */}
            <div className="md:col-span-2 bg-[#18181B]/40 border border-white/5 rounded-3xl p-8 relative overflow-hidden flex flex-col items-center justify-center min-h-[380px]">
              {/* IDLE state */}
              {demoState === 'idle' && (
                <div className="text-center space-y-5 animate-in fade-in duration-300 flex flex-col items-center">
                  <div className="h-16 w-16 rounded-full bg-indigo-500/10 border border-[#6366F1]/30 flex items-center justify-center text-[#6366F1] shadow-inner">
                    <Upload size={24} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-lg font-bold text-zinc-100">Simulate Workflow</h4>
                    <p className="text-xs text-zinc-400 max-w-sm mx-auto">We will upload a mock selfie to scan 1,347 event photos and isolate matches.</p>
                  </div>
                  <Button onClick={startDemo} className="bg-[#6366F1] hover:bg-[#6366F1]/90 text-white font-semibold shadow-md shadow-[#6366F1]/20">
                    Try Live Match
                  </Button>
                </div>
              )}

              {/* UPLOADING state */}
              {demoState === 'uploading' && (
                <div className="text-center space-y-3 animate-in fade-in duration-300 flex flex-col items-center">
                  <div className="h-8 w-8 rounded-full border-2 border-[#06B6D4] border-t-transparent animate-spin" />
                  <span className="text-xs font-bold text-zinc-300">Uploading mock selfie...</span>
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
                <div className="text-center space-y-3 animate-in fade-in duration-300 flex flex-col items-center w-full max-w-[280px]">
                  <div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                  <div className="space-y-2 w-full text-center">
                    <span className="text-xs font-mono text-zinc-300 block">Searching 1,347 photos...</span>
                    {demoAiStep === 0 && <span className="text-[10px] font-mono text-zinc-500">Detecting Faces [■■■■□□□□]</span>}
                    {demoAiStep === 1 && <span className="text-[10px] font-mono text-emerald-400 animate-pulse">Matching Faces [■■■■■■■□]</span>}
                    {demoAiStep === 2 && <span className="text-[10px] font-mono text-emerald-400 font-bold">Building Gallery [■■■■■■■■]</span>}
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

        {/* Section Final CTA */}
        <section className="px-6 py-24 bg-gradient-to-b from-zinc-950 to-[#09090B] border-t border-white/5 text-center relative overflow-hidden flex flex-col items-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#6366F1]/5 rounded-full filter blur-[100px] pointer-events-none" />
          <div className="max-w-2xl mx-auto space-y-6 relative z-10">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Ready to Find Every Photo You&apos;re In?
            </h2>
            <p className="text-sm text-[#A1A1AA] max-w-md mx-auto">
              Upload once. Share once. Let AI handle the rest.
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <Link href="/auth/sign-up">
                <Button size="lg" className="bg-[#FAFAFA] text-[#09090B] hover:bg-white px-8 h-12 font-semibold shadow-lg transition-transform duration-300 hover:scale-[1.02]">
                  Create Your First Event
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
