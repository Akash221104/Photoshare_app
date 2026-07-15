// app/page.tsx
// Storytelling landing page V3.2 (SaaS Simulation).
// Built with a premium dark theme, macOS SaaS dashboard windows, sequential FSM simulations, and live interactive widgets.

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
  CheckCircle2,
  Phone,
  Video,
  MoreVertical,
  ChevronLeft,
  Bell,
  Settings,
  FolderOpen,
  LayoutDashboard,
  Layers,
  Image as ImageIcon,
  UserCheck,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mock images representing correct matches for the AI scanner
const MATCHED_IMAGES = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&auto=format&fit=crop&q=80'
];

type SimState = 'idle' | 'organizer-active' | 'generate-qr' | 'guest-active' | 'upload-selfie' | 'searching' | 'completed';

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

  // --- Finite State Machine Simulation State ---
  const [simState, setSimState] = useState<SimState>('idle');
  const [uploadPercent, setUploadPercent] = useState(0);
  const [aiPercent, setAiPercent] = useState(0);
  const [showReplay, setShowReplay] = useState(false);

  // Trigger FSM Sequence
  const startSimulation = () => {
    setSimState('organizer-active');
    setUploadPercent(0);
    setAiPercent(0);
    setShowReplay(false);
  };

  useEffect(() => {
    if (simState === 'idle') return;

    let timer: NodeJS.Timeout;

    if (simState === 'organizer-active') {
      // Animate upload percent from 0 to 100
      const interval = setInterval(() => {
        setUploadPercent((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 25;
        });
      }, 300);

      timer = setTimeout(() => {
        clearInterval(interval);
        setSimState('generate-qr');
      }, 2800);
    } else if (simState === 'generate-qr') {
      timer = setTimeout(() => {
        setSimState('guest-active');
      }, 2500); // Allow QR to fly
    } else if (simState === 'guest-active') {
      timer = setTimeout(() => {
        setSimState('upload-selfie');
      }, 2000);
    } else if (simState === 'upload-selfie') {
      timer = setTimeout(() => {
        setSimState('searching');
      }, 2200);
    } else if (simState === 'searching') {
      // Animate AI matching search bar
      const interval = setInterval(() => {
        setAiPercent((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 15;
        });
      }, 200);

      timer = setTimeout(() => {
        clearInterval(interval);
        setSimState('completed');
      }, 3000);
    } else if (simState === 'completed') {
      // Show replay button after 2 seconds
      timer = setTimeout(() => {
        setShowReplay(true);
      }, 2000);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [simState]);

  // --- WhatsApp-Style Chat Simulator State ---
  const [chatStep, setChatStep] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setChatStep((prev) => (prev + 1) % 8);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#09090B] text-[#FAFAFA] font-sans antialiased overflow-hidden selection:bg-[#8B5CF6]/30">
      
      {/* Background glow meshes & noise */}
      <div className="absolute top-[-10%] left-[-15%] w-[60%] h-[60%] bg-[#8B5CF6]/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-15%] w-[65%] h-[65%] bg-[#EC4899]/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[5%] left-[10%] w-[50%] h-[50%] bg-[#8B5CF6]/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#09090B_80%)] opacity-60 pointer-events-none" />

      {/* Floating Header */}
      <header className="fixed top-0 left-0 right-0 h-16 border-b border-white/5 bg-[#09090B]/60 backdrop-blur-md z-50 flex items-center justify-between px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-[#8B5CF6] flex items-center justify-center shadow-md shadow-[#8B5CF6]/20">
            <Camera className="h-4 w-4 sm:h-[18px] sm:w-[18px] text-white" />
          </div>
          <span className="text-base sm:text-lg font-bold tracking-tight text-[#FAFAFA]">PhotoShare AI</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/auth/sign-in">
            <Button variant="ghost" size="sm" className="text-[#A1A1AA] hover:text-[#FAFAFA] text-xs sm:text-sm px-2 sm:px-3">Sign In</Button>
          </Link>
          <Link href="/auth/sign-up">
            <Button size="sm" className="bg-[#8B5CF6] hover:bg-[#8B5CF6]/90 text-white shadow-md shadow-[#8B5CF6]/20 transition-all duration-300 text-xs sm:text-sm px-2.5 sm:px-4">
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
              <Sparkles size={12} className="text-violet-400" />
              Private Event Matching Engine
            </div>
 
            {/* Dynamic Sliding Title */}
            <div className="min-h-[180px] xs:min-h-[140px] sm:min-h-[120px] flex items-center justify-center overflow-hidden">
              <h1 className="text-3xl xs:text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight max-w-3xl bg-gradient-to-b from-[#FAFAFA] to-[#A1A1AA] bg-clip-text text-transparent transition-all duration-500 transform translate-y-0 scale-100">
                {headlines[headlineIndex]}
              </h1>
            </div>
 
            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#A1A1AA] max-w-3xl mx-auto font-normal leading-relaxed">
              Upload event photos once. Guests simply scan a QR code or open a shared event link, upload one selfie, and instantly receive only the photos they&apos;re in.
            </p>
 
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2 w-full max-w-md sm:max-w-none mx-auto">
              <Link href="/auth/sign-up" className="w-full sm:w-auto">
                <Button size="lg" className="w-full bg-[#FAFAFA] text-[#09090B] hover:bg-[#FAFAFA]/95 px-8 h-12 shadow-lg transition-transform duration-300 hover:scale-[1.02] font-semibold">
                  Create Your First Event
                </Button>
              </Link>
              <a href="#demo-section" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full border-white/10 hover:bg-white/5 text-[#FAFAFA] px-8 h-12">
                  Watch 30-Second Demo
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* Section 2: The Privacy Mismatch (WhatsApp Chat) */}
        <section className="px-6 py-20 bg-zinc-950/40 border-y border-white/5 relative">
          <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center">
            
            {/* Left side: Explainer */}
            <div className="space-y-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-rose-500">The Privacy Mismatch</h2>
              <p className="text-3xl sm:text-4xl font-extrabold text-[#FAFAFA]">Shared Albums Expose Your Private Memories.</p>
              <p className="text-[#A1A1AA] text-sm leading-relaxed">
                When you share a cloud folder or standard photo link, you force a compromise. To let everyone find their photos, you expose **everything** to **everyone**. Unwanted frames, private angles, and personal memories are visible to all event attendees.
              </p>
            </div>

            {/* Right side: WhatsApp Chat Simulator */}
            <div className="w-full max-w-md mx-auto bg-[#0b141a] border border-white/5 rounded-3xl p-0 relative overflow-hidden min-h-[420px] flex flex-col justify-between shadow-2xl">
              
              {/* WhatsApp-Style Header */}
              <div className="bg-[#202c33] p-3 flex items-center justify-between border-b border-zinc-800 shrink-0">
                <div className="flex items-center gap-2">
                  <ChevronLeft className="text-emerald-400" size={18} />
                  <div className="h-9 w-9 rounded-full bg-zinc-700 flex items-center justify-center text-white font-bold text-xs uppercase">
                    R
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-100">Rahul</h4>
                    <span className="text-[9px] text-[#25D366] font-semibold flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#25D366] inline-block" /> online
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-zinc-300">
                  <Video size={16} />
                  <Phone size={14} />
                  <MoreVertical size={16} />
                </div>
              </div>

              {/* Chat Wallpaper Container */}
              <div className="flex-1 p-4 space-y-3 text-xs overflow-y-auto bg-[#0b141a] relative">
                
                {/* Chat Akash */}
                {chatStep >= 0 && (
                  <div className="flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-[#005c4b] text-zinc-100 rounded-2xl rounded-tr-none px-3 py-2 max-w-[80%] relative shadow-md">
                      <span>Can you send me my photos?</span>
                      <div className="text-[8px] text-zinc-400 text-right mt-1 font-mono flex items-center justify-end gap-0.5">
                        18:58 <span className="text-[#53bdeb] font-bold">✓✓</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Chat Rahul 1 */}
                {chatStep >= 1 && (
                  <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-[#202c33] text-[#FAFAFA] rounded-2xl rounded-tl-none px-3 py-2 max-w-[80%] relative shadow-md">
                      <span>I can... But I&apos;ll have to search through 1200 photos first.</span>
                      <div className="text-[8px] text-zinc-500 text-right mt-1 font-mono">
                        18:58
                      </div>
                    </div>
                  </div>
                )}

                {/* Chat Rahul 2 */}
                {chatStep >= 2 && (
                  <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-[#202c33] text-[#FAFAFA] rounded-2xl rounded-tl-none px-3 py-2 max-w-[80%] relative shadow-md">
                      <span>Or I can send everything.</span>
                      <div className="text-[8px] text-zinc-500 text-right mt-1 font-mono">
                        18:59
                      </div>
                    </div>
                  </div>
                )}

                {/* Chat Akash 2 */}
                {chatStep >= 3 && (
                  <div className="flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-[#005c4b] text-zinc-100 rounded-2xl rounded-tr-none px-3 py-2 max-w-[80%] relative shadow-md">
                      <span>Then I&apos;ll spend hours finding mine.</span>
                      <div className="text-[8px] text-zinc-400 text-right mt-1 font-mono flex items-center justify-end gap-0.5">
                        18:59 <span className="text-[#53bdeb] font-bold">✓✓</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Chat Rahul 3 */}
                {chatStep >= 4 && (
                  <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-[#202c33] text-[#FAFAFA] rounded-2xl rounded-tl-none px-3 py-2 max-w-[80%] relative shadow-md border border-[#25D366]/20">
                      <span className="text-emerald-400 font-bold block mb-1">Rahul</span>
                      <span>I&apos;ll just share the whole album.</span>
                      <div className="text-[8px] text-zinc-500 text-right mt-1 font-mono">
                        18:59
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Warning Popup Overlay */}
              {chatStep >= 5 && chatStep <= 6 && (
                <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300 z-20">
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
                <div className="absolute inset-0 bg-[#09090B] flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in duration-500 z-20">
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

        {/* Section 3: Who Is This For? */}
        <section className="px-6 py-20 bg-zinc-950/40 border-b border-white/5">
          <div className="max-w-7xl mx-auto w-full">
            <div className="text-center space-y-3 mb-16">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#8B5CF6]">Who Is This For?</h2>
              <p className="text-3xl sm:text-4xl font-extrabold text-[#FAFAFA]">Designed for Every Occasion</p>
              <p className="text-[#A1A1AA] max-w-xl mx-auto text-sm">Empowering event managers, couples, organizations, and runners.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {/* Card 1: Weddings */}
              <div className="bg-[#18181B] border border-white/5 rounded-2xl p-6 hover:border-[#8B5CF6]/30 transition-all duration-300">
                <span className="text-2xl block mb-4">💍</span>
                <h4 className="font-bold text-zinc-100 mb-1">Wedding Photographers</h4>
                <p className="text-xs text-[#A1A1AA] leading-relaxed">
                  Upload once. Every Guest Gets Their Photos.
                </p>
              </div>

              {/* Card 2: Festivals */}
              <div className="bg-[#18181B] border border-white/5 rounded-2xl p-6 hover:border-[#8B5CF6]/30 transition-all duration-300">
                <span className="text-2xl block mb-4">🎸</span>
                <h4 className="font-bold text-zinc-100 mb-1">College Festivals</h4>
                <p className="text-xs text-[#A1A1AA] leading-relaxed">
                  Thousands of Photos. No Manual Sharing.
                </p>
              </div>

              {/* Card 3: Corporate */}
              <div className="bg-[#18181B] border border-white/5 rounded-2xl p-6 hover:border-[#8B5CF6]/30 transition-all duration-300">
                <span className="text-2xl block mb-4">🏢</span>
                <h4 className="font-bold text-zinc-100 mb-1">Corporate Events</h4>
                <p className="text-xs text-[#A1A1AA] leading-relaxed">
                  Private Team Memories.
                </p>
              </div>

              {/* Card 4: Marathons */}
              <div className="bg-[#18181B] border border-white/5 rounded-2xl p-6 hover:border-[#8B5CF6]/30 transition-all duration-300">
                <span className="text-2xl block mb-4">🏃</span>
                <h4 className="font-bold text-zinc-100 mb-1">Marathons</h4>
                <p className="text-xs text-[#A1A1AA] leading-relaxed">
                  Find Yourself Instantly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* MERGED SECTION: Section 4 - One Upload. Customized Galleries & SaaS Simulation */}
        <section id="demo-section" className="relative px-6 max-w-7xl mx-auto w-full py-20 flex flex-col items-center">
          
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#8B5CF6]">One Upload. Customized Galleries.</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-[#FAFAFA]">Watch how one event instantly becomes hundreds of private galleries.</p>
            <p className="text-[#A1A1AA] max-w-2xl mx-auto text-sm leading-relaxed">
              Organizer uploads once. Guests simply join, upload one selfie, and receive only their own photos.
            </p>

            {/* FSM Controls overlay */}
            <div className="pt-4 flex justify-center gap-4 z-10">
              {simState === 'idle' && (
                <Button onClick={startSimulation} className="bg-[#8B5CF6] hover:bg-[#8B5CF6]/90 text-white font-bold px-8 h-12 shadow-lg shadow-[#8B5CF6]/20 animate-bounce">
                  ▶ Start Live Simulation
                </Button>
              )}
              {simState === 'completed' && showReplay && (
                <Button onClick={startSimulation} className="bg-zinc-800 hover:bg-zinc-700 text-[#FAFAFA] font-bold px-8 h-12 flex items-center gap-2 border border-white/10">
                  <RotateCcw size={16} /> Replay Simulation
                </Button>
              )}
              {simState !== 'idle' && simState !== 'completed' && (
                <span className="text-xs font-mono text-violet-400 bg-violet-500/10 px-4 py-2 rounded-full border border-violet-500/20 animate-pulse">
                  Simulation in Progress...
                </span>
              )}
            </div>
          </div>

          {/* Interactive Phone tab selectors */}
          <div className="flex justify-center gap-4 mb-8 z-10">
            <button 
              onClick={() => { if (simState !== 'idle') setSimState('organizer-active'); }}
              disabled={simState === 'idle'}
              className={`px-4 py-2 rounded-full text-xs font-bold border transition-all duration-300 ${simState === 'organizer-active' || simState === 'generate-qr' ? 'bg-[#8B5CF6] border-[#8B5CF6] text-white shadow-md shadow-[#8B5CF6]/20' : 'bg-zinc-900 border-white/5 text-zinc-400 hover:text-zinc-200'}`}
            >
              Organizer Dashboard
            </button>
            <button 
              onClick={() => { if (simState !== 'idle') setSimState('guest-active'); }}
              disabled={simState === 'idle'}
              className={`px-4 py-2 rounded-full text-xs font-bold border transition-all duration-300 ${simState === 'guest-active' || simState === 'upload-selfie' || simState === 'searching' || simState === 'completed' ? 'bg-[#EC4899] border-[#EC4899] text-white shadow-md shadow-[#EC4899]/20' : 'bg-zinc-900 border-white/5 text-zinc-400 hover:text-zinc-200'}`}
            >
              Guest Dashboard
            </button>
          </div>

          {/* macOS Browser Panels side-by-side layout */}
          <div className="relative grid lg:grid-cols-2 gap-8 max-w-7xl w-full items-stretch pt-4">
            
            {/* Flying QR Code overlay */}
            {simState === 'generate-qr' && (
              <div className="absolute top-[40%] left-1/4 z-40 pointer-events-none animate-fly-qr bg-white p-3 rounded-2xl shadow-2xl flex items-center justify-center border border-zinc-200 [--fly-x:0px] [--fly-y:540px] lg:[--fly-x:620px] lg:[--fly-y:20px]">
                <QrCode size={56} className="text-black" />
              </div>
            )}

            {/* ORGANIZER SAAS DASHBOARD */}
            <div className={`w-full rounded-2xl border-[2px] bg-[#18181B] shadow-2xl overflow-hidden transition-all duration-500 flex flex-col h-[520px] relative ${simState === 'organizer-active' || simState === 'generate-qr' ? 'border-[#8B5CF6] shadow-[#8B5CF6]/10 scale-[1.01]' : 'border-zinc-800 opacity-40 scale-[0.99] grayscale'}`}>
              
              {/* Browser bar */}
              <div className="bg-zinc-900 px-4 py-3 flex items-center justify-between border-b border-zinc-800 shrink-0">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <div className="bg-zinc-950 px-3 py-1 rounded-md text-[10px] font-mono text-zinc-400 max-w-[220px] truncate w-full text-center">
                  photoshare.ai/organizer/dashboard
                </div>
                <div className="w-12" />
              </div>

              {/* Dashboard Layout */}
              <div className="flex-1 flex overflow-hidden text-[11px]">
                {/* Sidebar */}
                <div className="hidden sm:flex w-40 border-r border-white/5 bg-zinc-900/50 p-3 flex-col justify-between shrink-0">
                  <div className="space-y-4">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block px-2">Navigation</span>
                    <ul className="space-y-1 text-zinc-300">
                      <li className="flex items-center gap-2 p-2 rounded-lg bg-zinc-800 text-[#FAFAFA] font-semibold">
                        <LayoutDashboard size={14} /> Dashboard
                      </li>
                      <li className="flex items-center gap-2 p-2 rounded-lg hover:bg-zinc-800/40">
                        <Layers size={14} /> Events
                      </li>
                      <li className="flex items-center gap-2 p-2 rounded-lg hover:bg-zinc-800/40">
                        <Users size={14} /> Guests
                      </li>
                      <li className="flex items-center gap-2 p-2 rounded-lg hover:bg-zinc-800/40">
                        <Upload size={14} /> Uploads
                      </li>
                    </ul>
                  </div>
                  <div className="border-t border-white/5 pt-3">
                    <span className="text-[10px] font-bold text-zinc-400 block px-2">Rahul (Admin)</span>
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-zinc-950">
                  
                  {/* Top Stats */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-[#18181B] border border-white/5 p-2 rounded-xl">
                      <span className="text-zinc-400 block text-[9px] uppercase font-mono">Photos</span>
                      <span className="text-sm font-bold text-[#FAFAFA]">1,247</span>
                    </div>
                    <div className="bg-[#18181B] border border-white/5 p-2 rounded-xl">
                      <span className="text-zinc-400 block text-[9px] uppercase font-mono">Guests</span>
                      <span className="text-sm font-bold text-[#FAFAFA]">184</span>
                    </div>
                    <div className="bg-[#18181B] border border-[#8B5CF6]/30 p-2 rounded-xl">
                      <span className="text-zinc-400 block text-[9px] uppercase font-mono">AI Progress</span>
                      <span className="text-sm font-bold text-[#8B5CF6]">96%</span>
                    </div>
                  </div>

                  {/* Event Information Card */}
                  <div className="bg-[#18181B] border border-white/5 p-3 rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-[#FAFAFA]">College Annual Fest 2026</h4>
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                        <span className="h-1 w-1 rounded-full bg-emerald-400 animate-ping" /> Live
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-zinc-400 text-[10px]">
                      <span>Venue: Pillai College Auditorium</span>
                      <span>Storage Used: 4.8 GB</span>
                    </div>
                  </div>

                  {/* Dynamic Simulation view content */}
                  {simState === 'organizer-active' && (
                    <div className="bg-zinc-900 border border-violet-500/30 p-4 rounded-xl space-y-3 animate-in fade-in duration-300">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-violet-400">Processing Upload Batch</span>
                        <span className="text-[10px] font-bold text-zinc-300">{uploadPercent}%</span>
                      </div>
                      <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden">
                        <div className="h-full bg-[#8B5CF6] rounded-full transition-all duration-300" style={{ width: `${uploadPercent}%` }} />
                      </div>
                      <p className="text-[9px] text-zinc-400">Running vector mappings on 1,247 uploads...</p>
                    </div>
                  )}

                  {/* Share Card step */}
                  {simState === 'generate-qr' && (
                    <div className="bg-zinc-900 border border-[#8B5CF6]/30 p-3 rounded-xl flex items-center justify-between animate-in fade-in duration-300">
                      <div className="space-y-1">
                        <h5 className="font-bold text-[#FAFAFA]">Share QR Code</h5>
                        <p className="text-[9px] text-zinc-400">Guests join to receive matching files</p>
                      </div>
                      <div className="h-12 w-12 bg-white rounded-lg flex items-center justify-center p-1 opacity-20">
                        <QrCode size={32} className="text-black" />
                      </div>
                    </div>
                  )}

                  {/* Recent Uploads Table */}
                  <div className="bg-[#18181B] border border-white/5 rounded-xl p-3 space-y-2">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Recent Uploads</span>
                    <div className="space-y-1.5 text-[9px] font-mono text-zinc-300">
                      <div className="flex justify-between items-center border-b border-white/5 pb-1">
                        <span>IMG_1204.jpg</span>
                        <span className="text-emerald-400">Completed</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-white/5 pb-1">
                        <span>IMG_1205.jpg</span>
                        <span className="text-emerald-400">Completed</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>IMG_1206.jpg</span>
                        {simState === 'organizer-active' ? (
                          <span className="text-amber-400 animate-pulse">Processing</span>
                        ) : (
                          <span className="text-emerald-400">Completed</span>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* GUEST SAAS DASHBOARD */}
            <div className={`w-full rounded-2xl border-[2px] bg-[#18181B] shadow-2xl overflow-hidden transition-all duration-500 flex flex-col h-[520px] relative ${simState === 'guest-active' || simState === 'upload-selfie' || simState === 'searching' || simState === 'completed' ? 'border-[#EC4899] shadow-[#EC4899]/10 scale-[1.01]' : 'border-zinc-800 opacity-40 scale-[0.99] grayscale'}`}>
              
              {/* Browser bar */}
              <div className="bg-zinc-900 px-4 py-3 flex items-center justify-between border-b border-zinc-800 shrink-0">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <div className="bg-zinc-950 px-3 py-1 rounded-md text-[10px] font-mono text-zinc-400 max-w-[220px] truncate w-full text-center">
                  photoshare.ai/guest/gallery
                </div>
                <div className="w-12" />
              </div>

              {/* Dashboard Layout */}
              <div className="flex-1 flex overflow-hidden text-[11px]">
                {/* Sidebar */}
                <div className="hidden sm:flex w-40 border-r border-white/5 bg-zinc-900/50 p-3 flex-col justify-between shrink-0">
                  <div className="space-y-4">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block px-2">Gallery</span>
                    <ul className="space-y-1 text-zinc-300">
                      <li className="flex items-center gap-2 p-2 rounded-lg bg-zinc-800 text-[#FAFAFA] font-semibold">
                        <ImageIcon size={14} /> My Gallery
                      </li>
                      <li className="flex items-center gap-2 p-2 rounded-lg hover:bg-zinc-800/40">
                        <Download size={14} /> Downloads
                      </li>
                      <li className="flex items-center gap-2 p-2 rounded-lg hover:bg-zinc-800/40">
                        <Layers size={14} /> Events
                      </li>
                      <li className="flex items-center gap-2 p-2 rounded-lg hover:bg-zinc-800/40">
                        <Settings size={14} /> Settings
                      </li>
                    </ul>
                  </div>
                  <div className="border-t border-white/5 pt-3">
                    <span className="text-[10px] font-bold text-zinc-400 block px-2">Akash (Guest)</span>
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-zinc-950">
                  
                  {/* Top Welcome Card */}
                  <div className="bg-[#18181B] border border-white/5 p-3 rounded-xl space-y-1">
                    <h4 className="font-bold text-[#FAFAFA]">Welcome back, Akash</h4>
                    <span className="text-[9px] text-[#EC4899] font-semibold block">Joined College Annual Fest 2026</span>
                  </div>

                  {/* Step 4 & 5: QR Scanning / Upload Selfie */}
                  {(simState === 'guest-active' || simState === 'upload-selfie') && (
                    <div className="bg-zinc-900 border border-pink-500/30 p-4 rounded-xl text-center space-y-3 animate-in fade-in duration-300 flex flex-col items-center">
                      <span className="text-[10px] font-bold text-[#EC4899] uppercase">Select Selfie File</span>
                      {simState === 'guest-active' ? (
                        <div className="h-10 w-28 bg-[#EC4899] text-white rounded-lg flex items-center justify-center text-xs font-bold animate-button-press cursor-pointer hover:bg-[#EC4899]/90">
                          Upload Selfie
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {/* Selfie upload preview */}
                          <div className="h-16 w-16 rounded-full overflow-hidden border border-white/10 relative mx-auto bg-zinc-800">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" alt="Selfie preview" className="h-full w-full object-cover animate-pulse" />
                          </div>
                          <span className="text-[9px] text-zinc-400 font-semibold block">selfie_akash.jpg selected</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 6: Searching & Scanning */}
                  {simState === 'searching' && (
                    <div className="bg-zinc-900 border border-pink-500/30 p-4 rounded-xl space-y-3 animate-in fade-in duration-300">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-[#EC4899]">Matching faces in 1,247 files...</span>
                        <span className="font-bold text-zinc-300">{aiPercent}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden">
                        <div className="h-full bg-[#EC4899] rounded-full transition-all duration-300" style={{ width: `${aiPercent}%` }} />
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 text-[9px] text-zinc-500">
                        <span className="text-[#EC4899]">✔ Detected</span>
                        <span className={aiPercent >= 50 ? 'text-[#EC4899]' : ''}>Matching...</span>
                        <span className={aiPercent >= 100 ? 'text-emerald-400' : ''}>Gallery Ready</span>
                      </div>
                    </div>
                  )}

                  {/* Step 7: Completed Grid */}
                  {simState === 'completed' && (
                    <div className="space-y-4 animate-in fade-in duration-500">
                      <div className="bg-[#18181B] border border-emerald-500/20 p-3 rounded-xl flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-semibold text-emerald-400 uppercase">Private Gallery Unlocked</span>
                          <h5 className="font-bold text-[#FAFAFA]">126 Photos Found</h5>
                        </div>
                        <Button className="bg-[#EC4899] text-white hover:bg-[#EC4899]/90 font-bold text-[10px] h-7 px-3 flex items-center gap-1">
                          <Download size={10} /> Download All
                        </Button>
                      </div>

                      {/* Matched Grid */}
                      <div className="grid grid-cols-3 gap-2">
                        {MATCHED_IMAGES.slice(0, 3).map((img, i) => (
                          <div key={i} className="aspect-square rounded-lg overflow-hidden border border-white/5 relative group">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={img} alt="Matched pic" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Section 5: Privacy Comparison Layout */}
        <section className="px-6 py-20 max-w-7xl mx-auto w-full">
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#EC4899] flex items-center justify-center gap-1">
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
                  <div className="text-zinc-650">→</div>
                  <div className="text-[10px] bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl text-rose-300 font-bold">
                    All 1,200 Photos Public ❌
                  </div>
                </div>
              </div>
            </div>

            {/* Right: PhotoShare AI */}
            <div className="bg-[#18181B] border border-[#EC4899]/20 rounded-3xl p-8 flex flex-col justify-between shadow-lg shadow-[#EC4899]/5 hover:border-[#EC4899]/40 transition-all duration-300">
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-[#EC4899] flex items-center gap-1.5 uppercase">
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
                    <span className="text-zinc-600">Host Dashboard</span>
                    <span className="text-[#EC4899] font-bold">Manage Event Only</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Section Final CTA */}
        <section className="px-6 py-24 bg-gradient-to-b from-zinc-900 to-[#09090B] border-t border-white/5 text-center relative overflow-hidden flex flex-col items-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#8B5CF6]/5 rounded-full filter blur-[100px] pointer-events-none" />
          <div className="max-w-2xl mx-auto space-y-6 relative z-10">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Ready to Find Every Photo You&apos;re In?
            </h2>
            <p className="text-sm text-[#A1A1AA] max-w-md mx-auto">
              Upload once. Share once. Let AI handle the rest.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 w-full max-w-md mx-auto sm:max-w-none">
              <Link href="/auth/sign-up" className="w-full sm:w-auto">
                <Button size="lg" className="w-full bg-[#FAFAFA] text-[#09090B] hover:bg-white px-8 h-12 font-semibold shadow-lg transition-transform duration-300 hover:scale-[1.02]">
                  Create Your First Event
                </Button>
              </Link>
              <Link href="/auth/sign-in" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full border-white/10 hover:bg-white/5 px-8 h-12">
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
