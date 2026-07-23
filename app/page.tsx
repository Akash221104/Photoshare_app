// app/page.tsx
// Storytelling landing page V4.0 (Luxury Event Memories Platform).
// Designed with Apple × Airbnb × Instagram × Linear × Framer aesthetics.

'use client';

import { useState, useEffect, useRef } from 'react';
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
  RotateCcw,
  Heart,
  Star
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
  const [activeTab, setActiveTab] = useState<'organizer' | 'guest'>('organizer');
  const [uploadPercent, setUploadPercent] = useState(0);
  const [aiPercent, setAiPercent] = useState(0);
  const [showReplay, setShowReplay] = useState(false);

  // Trigger FSM Sequence
  const startSimulation = () => {
    setSimState('organizer-active');
    setActiveTab('organizer');
    setUploadPercent(0);
    setAiPercent(0);
    setShowReplay(false);
  };

  useEffect(() => {
    if (simState === 'idle') return;

    let timer: NodeJS.Timeout;

    if (simState === 'organizer-active') {
      setActiveTab('organizer');
      // Animate upload percent from 0 to 100 at a comfortable, readable speed
      const interval = setInterval(() => {
        setUploadPercent((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 350);

      timer = setTimeout(() => {
        clearInterval(interval);
        setSimState('generate-qr');
      }, 4500);
    } else if (simState === 'generate-qr') {
      setActiveTab('organizer');
      timer = setTimeout(() => {
        setSimState('guest-active');
        setActiveTab('guest'); // Auto slide to Guest view
      }, 2500); // Allow QR to fly
    } else if (simState === 'guest-active') {
      setActiveTab('guest');
      timer = setTimeout(() => {
        setSimState('upload-selfie');
      }, 2000);
    } else if (simState === 'upload-selfie') {
      setActiveTab('guest');
      timer = setTimeout(() => {
        setSimState('searching');
      }, 2200);
    } else if (simState === 'searching') {
      setActiveTab('guest');
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
      setActiveTab('guest');
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
  const [isChatVisible, setIsChatVisible] = useState(false);
  const chatSectionRef = useRef<HTMLDivElement>(null);

  // Scroll Intersection Observer: Start animation when section enters 10% of viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsChatVisible(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    const currentRef = chatSectionRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);

  useEffect(() => {
    if (!isChatVisible) return;

    // Start step progression immediately on visibility
    setChatStep(0);
    const interval = setInterval(() => {
      setChatStep((prev) => (prev + 1) % 8);
    }, 2000);
    return () => clearInterval(interval);
  }, [isChatVisible]);

  return (
    <div className="flex flex-col min-h-screen bg-[#FFFDF8] text-[#525252] font-sans antialiased overflow-hidden selection:bg-[#FFB703]/20 selection:text-[#FB8500]">

      {/* Background radial hero glow */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[600px] hero-radial-glow pointer-events-none z-0 overflow-hidden" />

      {/* 2026 Ultra-Modern Floating Island Navbar */}
      <header className="fixed top-3 sm:top-4 left-3 right-3 sm:left-6 sm:right-6 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-[92%] max-w-6xl z-50 h-16 rounded-full border border-[rgba(255,170,80,0.25)] bg-white/95 backdrop-blur-2xl shadow-xl shadow-[#FB8500]/10 px-3 sm:px-6 flex items-center justify-between transition-all duration-300">

        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-[#FFB703] to-[#FB8500] flex items-center justify-center text-white shadow-md shadow-[#FB8500]/25 group-hover:scale-105 transition-transform">
            <Camera className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="text-base sm:text-lg font-bold tracking-tight font-serif-display text-[#1A1A1A]">PhotoShare AI</span>
        </Link>

        {/* Centered Modern Nav Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 bg-[#FFF8F2] px-3 py-1.5 rounded-full border border-[rgba(255,170,80,0.15)]">
          <a href="#demo-section" className="px-3.5 py-1 rounded-full text-xs font-bold text-[#525252] hover:text-[#FB8500] hover:bg-white transition-all">
            Live Demo
          </a>
          <a href="#privacy-section" className="px-3.5 py-1 rounded-full text-xs font-bold text-[#525252] hover:text-[#FB8500] hover:bg-white transition-all">
            Privacy
          </a>
          <a href="#use-cases" className="px-3.5 py-1 rounded-full text-xs font-bold text-[#525252] hover:text-[#FB8500] hover:bg-white transition-all">
            Use Cases
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <Link href="/auth/sign-in">
            <button className="btn-secondary-luxury !h-9 sm:!h-10 !px-3 sm:!px-5 !text-[11px] sm:!text-xs">
              Sign In
            </button>
          </Link>
          <Link href="/auth/sign-up">
            <button className="btn-primary-luxury !h-9 sm:!h-10 !px-3.5 sm:!px-5 !text-[11px] sm:!text-xs">
              Get Started
            </button>
          </Link>
        </div>
      </header>

      {/* Hero Section (Unique 2026 Light Luxury Silk Canvas) */}
      <main className="flex-1 pt-20 sm:pt-24 bg-gradient-to-b from-[#FFF4E8] via-[#FFFDF8] to-[#FFFDF8] overflow-hidden">
        <section className="relative w-full min-h-[calc(100vh-80px)] sm:min-h-[calc(100vh-96px)] flex flex-col items-center justify-center px-4 sm:px-6 py-10 sm:py-16 overflow-hidden">
          
          {/* Unique Refined Light Micro-Grid Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#FB8500_1.2px,transparent_1.2px)] [background-size:28px_28px] opacity-15 [mask-image:radial-gradient(ellipse_75%_65%_at_50%_40%,#000_65%,transparent_100%)] pointer-events-none" />

          {/* Top Center Soft Warm Silk Glow Field */}
          <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-full max-w-[1200px] sm:max-w-[1400px] h-[650px] bg-[radial-gradient(ellipse_at_top,rgba(255,183,3,0.30)_0%,rgba(251,133,0,0.12)_45%,transparent_75%)] pointer-events-none z-0 overflow-hidden" />

          {/* Floating Organic Light Spheres */}
          <div className="absolute top-8 left-[4%] w-full max-w-[500px] h-[500px] bg-gradient-to-br from-[#FFB703]/22 via-[#FB8500]/14 to-transparent rounded-full blur-[100px] animate-float-slow pointer-events-none" />
          <div className="absolute bottom-4 right-[4%] w-full max-w-[500px] h-[500px] bg-gradient-to-tr from-[#FB8500]/16 via-[#FF6B6B]/12 to-transparent rounded-full blur-[100px] animate-float-reverse pointer-events-none" />

          {/* Floating Glass Memory Badges (Positioned gracefully near the title - Desktop) */}
          <div className="hidden lg:flex items-center gap-3.5 absolute top-32 left-8 xl:left-20 bg-white/85 backdrop-blur-xl border border-[rgba(255,170,80,0.22)] rounded-2xl p-4 shadow-xl shadow-[#FB8500]/10 animate-float-slow pointer-events-none z-10">
            <div className="flex -space-x-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" alt="Avatar" className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-sm" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Avatar" className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-sm" />
            </div>
            <div className="text-left">
              <span className="text-xs font-bold text-[#1A1A1A] flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                1,247 Photos Matched
              </span>
              <span className="text-[10px] text-[#FB8500] font-bold">Instant AI Delivery</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-3.5 absolute top-40 right-8 xl:right-20 bg-white/85 backdrop-blur-xl border border-rose-200 rounded-2xl p-4 shadow-xl shadow-[#E63946]/5 animate-float-reverse pointer-events-none z-10">
            <div className="h-9 w-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-[#E63946] font-bold text-xs shadow-xs">
              <ShieldCheck size={20} />
            </div>
            <div className="text-left">
              <span className="text-xs font-bold text-[#1A1A1A] block">100% Private Vault</span>
              <span className="text-[10px] text-[#E63946] font-bold">🔒 Zero Public Exposure</span>
            </div>
          </div>

          {/* Headline & Slogans Container */}
          <div className="text-center max-w-5xl space-y-7 relative z-20 my-auto">

            {/* Top Pill Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[rgba(255,170,80,0.25)] bg-white text-xs font-bold text-[#FB8500] shadow-sm">
              <Sparkles size={14} className="text-[#FFB703]" />
              Private Event Matching Engine
            </div>

            {/* Stable Height Headline Box */}
            <div className="h-[120px] sm:h-[135px] md:h-[150px] flex items-center justify-center relative overflow-hidden">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif-display font-normal tracking-tight leading-[1.15] text-[#1A1A1A] max-w-4xl mx-auto transition-opacity duration-500">
                {headlines[headlineIndex]}
              </h1>
            </div>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#525252] max-w-2xl mx-auto font-normal leading-[1.7]">
              Upload event photos once. Guests simply scan a QR code or open a shared event link, upload one selfie, and instantly receive only the photos they&apos;re in.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2 w-full max-w-md sm:max-w-none mx-auto">
              <Link href="/auth/sign-up" className="w-full sm:w-auto">
                <button className="btn-primary-luxury w-full sm:w-auto text-base">
                  Create Your First Event <ArrowRight size={18} className="ml-2" />
                </button>
              </Link>
              <a href="#demo-section" className="w-full sm:w-auto">
                <button className="btn-secondary-luxury w-full sm:w-auto text-base">
                  Watch 30-Second Demo
                </button>
              </a>
            </div>
          </div>
        </section>

        {/* Section 2: The Privacy Mismatch (WhatsApp / iMessage Chat Simulation) */}
        <section id="privacy-section" ref={chatSectionRef} className="px-6 py-28 bg-[#FFF8F2] border-y border-[rgba(255,170,80,0.12)] relative overflow-hidden">
          {/* Ambient Blurred Red & Orange Orbs */}
          <div className="absolute top-1/2 left-[-10%] -translate-y-1/2 w-96 h-96 bg-[#E63946]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-[#FB8500]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-16 items-center relative z-10">

            {/* Left side: Explainer */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full border-2 border-[#E63946]/35 bg-gradient-to-r from-rose-100/90 via-rose-50 to-rose-100/90 text-base sm:text-lg lg:text-xl font-serif-display font-extrabold tracking-wide text-[#E63946] shadow-xl shadow-[#E63946]/15">
                <AlertCircle size={22} className="text-[#E63946] animate-pulse shrink-0" />
                <span>The Privacy Mismatch</span>
              </div>
              <h2 className="text-4xl sm:text-6xl lg:text-7xl font-serif-display font-normal text-[#1A1A1A] leading-[1.12] tracking-tight">
                Shared Albums Expose Your <span className="text-[#E63946] font-serif-display font-normal italic">Private Memories.</span>
              </h2>
              <p className="text-[#525252] text-lg sm:text-xl leading-relaxed font-normal">
                When you share a cloud folder or standard photo link, you force a compromise. To let everyone find their photos, you expose <strong className="text-[#1A1A1A] font-bold">everything</strong> to <strong className="text-[#1A1A1A] font-bold">everyone</strong>. Unwanted frames, private angles, and personal memories are visible to all event attendees.
              </p>
            </div>

            {/* Right side: iPhone 16 Pro Chat Simulator Frame */}
            <div className="w-full max-w-sm sm:max-w-md mx-auto bg-[#0b141a] border-[5px] border-[#1A1A1A] rounded-[40px] p-0 relative overflow-hidden min-h-[500px] flex flex-col justify-between shadow-2xl shadow-[#FB8500]/10">

              {/* Dynamic Island Pill Top Notch */}
              <div className="bg-black py-2 shrink-0 border-b border-zinc-800/50">
                <div className="h-4 w-28 bg-[#1A1A1A] rounded-full mx-auto flex items-center justify-between px-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500/80 animate-pulse" />
                  <div className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
                </div>
              </div>

              {/* iOS Chat Header */}
              <div className="bg-[#1f2c34]/95 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-zinc-800/80 shrink-0">
                <div className="flex items-center gap-3">
                  <ChevronLeft className="text-[#25D366]" size={20} />
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#FFB703] to-[#FB8500] flex items-center justify-center text-white font-extrabold text-sm shadow-md">
                    R
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                      Rahul <span className="text-[10px] text-zinc-400 font-normal">(Host)</span>
                    </h4>
                    <span className="text-[10px] text-[#25D366] font-semibold flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#25D366] inline-block animate-ping" /> online
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-zinc-400">
                  <Video size={18} />
                  <Phone size={16} />
                </div>
              </div>

              {/* Chat Wallpaper Container */}
              <div className="flex-1 p-5 space-y-4 text-xs overflow-y-auto bg-[#0b141a] relative">

                {/* Chat Akash */}
                {chatStep >= 0 && (
                  <div className="flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-[#005c4b] text-zinc-100 rounded-2xl rounded-tr-none px-4 py-2.5 max-w-[80%] relative shadow-md">
                      <span className="text-xs font-medium">Can you send me my photos?</span>
                      <div className="text-[9px] text-zinc-300 text-right mt-1 font-mono flex items-center justify-end gap-0.5">
                        18:58 <span className="text-[#53bdeb] font-bold">✓✓</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Chat Rahul 1 */}
                {chatStep >= 1 && (
                  <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-[#202c33] text-[#FAFAFA] rounded-2xl rounded-tl-none px-4 py-2.5 max-w-[80%] relative shadow-md">
                      <span className="text-xs font-medium">I can... But I&apos;ll have to search through 1,200 photos first.</span>
                      <div className="text-[9px] text-zinc-400 text-right mt-1 font-mono">
                        18:58
                      </div>
                    </div>
                  </div>
                )}

                {/* Chat Rahul 2 */}
                {chatStep >= 2 && (
                  <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-[#202c33] text-[#FAFAFA] rounded-2xl rounded-tl-none px-4 py-2.5 max-w-[80%] relative shadow-md">
                      <span className="text-xs font-medium">Or I can send everything in a shared link.</span>
                      <div className="text-[9px] text-zinc-400 text-right mt-1 font-mono">
                        18:59
                      </div>
                    </div>
                  </div>
                )}

                {/* Chat Akash 2 */}
                {chatStep >= 3 && (
                  <div className="flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-[#005c4b] text-zinc-100 rounded-2xl rounded-tr-none px-4 py-2.5 max-w-[80%] relative shadow-md">
                      <span className="text-xs font-medium">Then I&apos;ll spend hours finding mine!</span>
                      <div className="text-[9px] text-zinc-300 text-right mt-1 font-mono flex items-center justify-end gap-0.5">
                        18:59 <span className="text-[#53bdeb] font-bold">✓✓</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Chat Rahul 3 */}
                {chatStep >= 4 && (
                  <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-[#202c33] text-[#FAFAFA] rounded-2xl rounded-tl-none px-4 py-2.5 max-w-[80%] relative shadow-md border border-rose-500/30">
                      <span className="text-[#E63946] font-bold block mb-1">Rahul</span>
                      <span className="text-xs font-medium">I&apos;ll just share the whole Google Drive link.</span>
                      <div className="text-[9px] text-zinc-400 text-right mt-1 font-mono">
                        18:59
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Warning Popup Overlay */}
              {chatStep >= 5 && chatStep <= 6 && (
                <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300 z-20">
                  <div className="bg-[#1A1A1A] border-2 border-[#E63946]/50 rounded-3xl p-6 space-y-4 max-w-xs text-center shadow-2xl relative">
                    <div className="h-12 w-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-[#E63946] mx-auto animate-bounce shadow-md">
                      <AlertTriangle size={24} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-extrabold text-zinc-100 uppercase tracking-wide">Privacy Breach Risk</h4>
                      <p className="text-xs text-zinc-300">1,200 Photos Publicly Exposed to Everyone:</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-rose-300 font-medium text-left bg-zinc-900/80 p-3 rounded-xl border border-white/10">
                      <span>• Your Photos</span>
                      <span>• Unwanted Photos</span>
                      <span>• Private Moments</span>
                      <span>• Other Guests</span>
                    </div>
                    <span className="text-[10px] text-[#E63946] font-bold flex items-center justify-center gap-1.5 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                      <EyeOff size={12} /> Public Folder Shared ❌
                    </span>
                  </div>
                </div>
              )}

              {/* Success PhotoShare AI transition */}
              {chatStep === 7 && (
                <div className="absolute inset-0 bg-[#FFFDF8] flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in duration-500 z-20">
                  <div className="h-16 w-16 rounded-2xl bg-emerald-500/15 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-600 mb-4 shadow-lg animate-bounce">
                    <ShieldCheck size={32} />
                  </div>
                  <h4 className="text-lg font-bold font-serif-display text-[#1A1A1A] mb-1">PhotoShare AI Solution</h4>
                  <p className="text-xs text-[#525252] text-center max-w-[220px] mb-3">
                    Selfie Key Decryption Complete
                  </p>
                  <span className="text-xs text-emerald-700 font-extrabold bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-200 shadow-xs">
                    🔒 126 Private Photos Unlocked
                  </span>
                </div>
              )}

            </div>
          </div>
        </section>

        {/* Section 3: Who Is This For? (2026 Luxury Interactive Bento Grid) */}
        <section id="use-cases" className="px-6 py-28 bg-[#FFFDF8] relative overflow-hidden">
          {/* Subtle Ambient Grid Background */}
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,183,3,0.12)_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none" />

          <div className="max-w-7xl mx-auto w-full relative z-10">
            <div className="text-center space-y-4 mb-20">
              <span className="text-xs font-bold uppercase tracking-widest text-[#FB8500] bg-[#FFF8F2] px-4 py-1.5 rounded-full border border-[rgba(255,170,80,0.25)] shadow-xs">Who Is This For?</span>
              <h2 className="text-4xl sm:text-6xl font-serif-display text-[#1A1A1A]">Designed for Every Occasion</h2>
              <p className="text-[#525252] max-w-xl mx-auto text-lg leading-relaxed">
                Empowering event managers, couples, organizations, and runners.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">

              {/* Card 1: Weddings */}
              <div className="group relative rounded-[28px] overflow-hidden bg-white border border-[rgba(255,170,80,0.25)] shadow-md hover:shadow-2xl hover:-translate-y-2.5 transition-all duration-500 flex flex-col justify-between h-[390px] p-6">
                {/* Background Image Preview - Highly Visible */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80"
                    alt="Wedding"
                    className="w-full h-full object-cover opacity-45 group-hover:opacity-75 group-hover:scale-110 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/65 to-white/20" />
                </div>

                <div className="relative z-10 space-y-4">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#FFB703] to-[#FB8500] flex items-center justify-center text-3xl shadow-lg shadow-[#FB8500]/25 group-hover:rotate-6 group-hover:scale-110 transition-all duration-300">
                    💍
                  </div>
                  <h3 className="font-serif-display font-bold text-2xl text-[#1A1A1A] group-hover:text-[#FB8500] transition-colors">
                    Wedding Photographers
                  </h3>
                  <p className="text-sm font-medium text-[#333333] leading-relaxed">
                    Upload once. Every guest receives only their own private moments instantly.
                  </p>
                </div>

                <div className="relative z-10 pt-4 flex flex-wrap gap-2">
                  <span className="text-[10px] font-extrabold text-[#FB8500] bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-[rgba(255,170,80,0.3)] shadow-xs">
                    ✨ 1,000+ Guests
                  </span>
                  <span className="text-[10px] font-extrabold text-emerald-700 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-300 shadow-xs">
                    🔒 Private
                  </span>
                </div>
              </div>

              {/* Card 2: Festivals */}
              <div className="group relative rounded-[28px] overflow-hidden bg-white border border-[rgba(255,170,80,0.25)] shadow-md hover:shadow-2xl hover:-translate-y-2.5 transition-all duration-500 flex flex-col justify-between h-[390px] p-6">
                {/* Background Image Preview - Highly Visible */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&auto=format&fit=crop&q=80"
                    alt="Festival"
                    className="w-full h-full object-cover opacity-45 group-hover:opacity-75 group-hover:scale-110 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/65 to-white/20" />
                </div>

                <div className="relative z-10 space-y-4">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#FFB703] to-[#FB8500] flex items-center justify-center text-3xl shadow-lg shadow-[#FB8500]/25 group-hover:rotate-6 group-hover:scale-110 transition-all duration-300">
                    🎸
                  </div>
                  <h3 className="font-serif-display font-bold text-2xl text-[#1A1A1A] group-hover:text-[#FB8500] transition-colors">
                    College Festivals
                  </h3>
                  <p className="text-sm font-medium text-[#333333] leading-relaxed">
                    Thousands of photos distributed instantly. No manual sharing chaos.
                  </p>
                </div>

                <div className="relative z-10 pt-4 flex flex-wrap gap-2">
                  <span className="text-[10px] font-extrabold text-[#FB8500] bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-[rgba(255,170,80,0.3)] shadow-xs">
                    ⚡ 10,000+ Attendees
                  </span>
                  <span className="text-[10px] font-extrabold text-[#FF6B6B] bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-rose-300 shadow-xs">
                    🚀 Zero Chaos
                  </span>
                </div>
              </div>

              {/* Card 3: Corporate Events */}
              <div className="group relative rounded-[28px] overflow-hidden bg-white border border-[rgba(255,170,80,0.25)] shadow-md hover:shadow-2xl hover:-translate-y-2.5 transition-all duration-500 flex flex-col justify-between h-[390px] p-6">
                {/* Background Image Preview - Highly Visible */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80"
                    alt="Corporate"
                    className="w-full h-full object-cover opacity-45 group-hover:opacity-75 group-hover:scale-110 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/65 to-white/20" />
                </div>

                <div className="relative z-10 space-y-4">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#FFB703] to-[#FB8500] flex items-center justify-center text-3xl shadow-lg shadow-[#FB8500]/25 group-hover:rotate-6 group-hover:scale-110 transition-all duration-300">
                    🏢
                  </div>
                  <h3 className="font-serif-display font-bold text-2xl text-[#1A1A1A] group-hover:text-[#FB8500] transition-colors">
                    Corporate Events
                  </h3>
                  <p className="text-sm font-medium text-[#333333] leading-relaxed">
                    Secure internal team memories with zero public exposure risk.
                  </p>
                </div>

                <div className="relative z-10 pt-4 flex flex-wrap gap-2">
                  <span className="text-[10px] font-extrabold text-emerald-700 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-300 shadow-xs">
                    🔒 Private Vault
                  </span>
                  <span className="text-[10px] font-extrabold text-[#FB8500] bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-[rgba(255,170,80,0.3)] shadow-xs">
                    🏢 Team Security
                  </span>
                </div>
              </div>

              {/* Card 4: Marathons & Sports */}
              <div className="group relative rounded-[28px] overflow-hidden bg-white border border-[rgba(255,170,80,0.25)] shadow-md hover:shadow-2xl hover:-translate-y-2.5 transition-all duration-500 flex flex-col justify-between h-[390px] p-6">
                {/* Background Image Preview - Highly Visible */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800&auto=format&fit=crop&q=80"
                    alt="Marathon"
                    className="w-full h-full object-cover opacity-45 group-hover:opacity-75 group-hover:scale-110 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/65 to-white/20" />
                </div>

                <div className="relative z-10 space-y-4">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#FFB703] to-[#FB8500] flex items-center justify-center text-3xl shadow-lg shadow-[#FB8500]/25 group-hover:rotate-6 group-hover:scale-110 transition-all duration-300">
                    🏃
                  </div>
                  <h3 className="font-serif-display font-bold text-2xl text-[#1A1A1A] group-hover:text-[#FB8500] transition-colors">
                    Marathons & Sports
                  </h3>
                  <p className="text-sm font-medium text-[#333333] leading-relaxed">
                    Runners find their action race photos instantly using facial recognition.
                  </p>
                </div>

                <div className="relative z-10 pt-4 flex flex-wrap gap-2">
                  <span className="text-[10px] font-extrabold text-[#FB8500] bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-[rgba(255,170,80,0.3)] shadow-xs">
                    ⏱️ Instant Match
                  </span>
                  <span className="text-[10px] font-extrabold text-emerald-700 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-300 shadow-xs">
                    🏃 Face Scan
                  </span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* MERGED SECTION: Section 4 - One Upload. Customized Galleries & SaaS Simulation */}
        <section id="demo-section" className="relative px-6 max-w-7xl mx-auto w-full py-24 flex flex-col items-center bg-[#FFF6EC] rounded-[36px] my-12 border border-[rgba(255,170,80,0.2)] shadow-sm">

          <div className="text-center space-y-5 mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-[#FB8500] bg-white px-4 py-1.5 rounded-full border border-[rgba(255,170,80,0.2)]">Interactive Platform Demo</span>
            <h2 className="text-4xl sm:text-5xl font-serif-display text-[#1A1A1A]">One Upload. Customized Galleries.</h2>
            <p className="text-[#525252] max-w-2xl mx-auto text-lg leading-[1.7]">
              Organizer uploads once. Guests simply join, upload one selfie, and receive only their own photos.
            </p>

            {/* FSM Controls overlay */}
            <div className="pt-4 flex flex-wrap justify-center gap-3 z-10">
              <button
                onClick={startSimulation}
                className="btn-primary-luxury text-sm sm:text-base flex items-center gap-2 shadow-lg shadow-[#FB8500]/25 hover:scale-105 active:scale-95 transition-all"
              >
                <span>▶</span> {simState === 'idle' ? 'Start Live Simulation' : 'Restart Simulation'}
              </button>
              {simState === 'completed' && showReplay && (
                <button onClick={startSimulation} className="btn-secondary-luxury text-xs sm:text-sm flex items-center gap-2">
                  <RotateCcw size={16} /> Replay Demo
                </button>
              )}
              {simState !== 'idle' && simState !== 'completed' && (
                <span className="text-xs font-bold text-[#FB8500] bg-white px-4 py-2 rounded-full border border-[rgba(255,170,80,0.3)] shadow-sm animate-pulse flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#FB8500] animate-ping" />
                  {simState === 'organizer-active' && 'Step 1: Organizer Uploading...'}
                  {simState === 'generate-qr' && 'Step 2: Generating Event QR...'}
                  {simState === 'guest-active' && 'Step 3: Guest Joined Event'}
                  {simState === 'upload-selfie' && 'Step 4: Guest Uploading Selfie...'}
                  {simState === 'searching' && 'Step 5: AI Face Matching...'}
                </span>
              )}
            </div>
          </div>

          {/* Interactive view switcher tabs - Always clickable */}
          <div className="flex justify-center gap-3 mb-8 z-10 w-full max-w-md mx-auto">
            <button
              onClick={() => setActiveTab('organizer')}
              className={`flex-1 px-4 py-2.5 sm:px-6 sm:py-3 rounded-full text-xs sm:text-sm font-extrabold border transition-all duration-300 shadow-sm flex items-center justify-center gap-2 ${
                activeTab === 'organizer'
                  ? 'bg-[#FB8500] border-[#FB8500] text-white shadow-md shadow-[#FB8500]/25 scale-[1.02]'
                  : 'bg-white border-[rgba(255,170,80,0.3)] text-[#525252] hover:text-[#1A1A1A] hover:bg-white/80'
              }`}
            >
              <LayoutDashboard size={16} />
              <span>Organizer View</span>
            </button>
            <button
              onClick={() => setActiveTab('guest')}
              className={`flex-1 px-4 py-2.5 sm:px-6 sm:py-3 rounded-full text-xs sm:text-sm font-extrabold border transition-all duration-300 shadow-sm flex items-center justify-center gap-2 ${
                activeTab === 'guest'
                  ? 'bg-[#FF6B6B] border-[#FF6B6B] text-white shadow-md shadow-[#FF6B6B]/25 scale-[1.02]'
                  : 'bg-white border-[rgba(255,170,80,0.3)] text-[#525252] hover:text-[#1A1A1A] hover:bg-white/80'
              }`}
            >
              <Users size={16} />
              <span>Guest View</span>
            </button>
          </div>

          {/* Flying QR Code overlay */}
          {simState === 'generate-qr' && (
            <div className="absolute top-[45%] left-1/2 -translate-x-1/2 lg:left-1/4 z-50 pointer-events-none animate-fly-qr bg-white p-4 rounded-3xl shadow-2xl flex items-center justify-center border-2 border-amber-300 [--fly-x:0px] [--fly-y:340px] lg:[--fly-x:620px] lg:[--fly-y:20px]">
              <QrCode size={64} className="text-[#1A1A1A]" />
            </div>
          )}

          {/* MOBILE SLIDER CONTAINER (< 1024px) */}
          <div className="lg:hidden w-full max-w-xl mx-auto overflow-hidden relative rounded-[28px] p-1">
            <div
              className="flex w-[200%] transition-transform duration-500 ease-out"
              style={{ transform: activeTab === 'organizer' ? 'translateX(0%)' : 'translateX(-50%)' }}
            >
              {/* MOBILE ORGANIZER PANEL */}
              <div className="w-1/2 pr-2">
                <div className={`w-full rounded-[28px] border-2 bg-white shadow-xl overflow-hidden transition-all duration-300 flex flex-col h-[520px] relative ${activeTab === 'organizer' ? 'border-[#FB8500] shadow-[#FB8500]/15' : 'border-[rgba(255,170,80,0.2)]'}`}>
                  {/* Browser bar */}
                  <div className="bg-[#FFF8F2] px-4 py-3 flex items-center justify-between border-b border-[rgba(255,170,80,0.15)] shrink-0">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#E63946]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#FFB703]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
                    </div>
                    <div className="bg-white px-3 py-0.5 rounded-full text-[10px] font-mono text-[#8A8A8A] border border-[rgba(255,170,80,0.2)] max-w-[200px] truncate text-center">
                      photoshare.ai/organizer
                    </div>
                    <div className="w-8" />
                  </div>

                  {/* Organizer Content */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-white text-xs">
                    {/* Top Stats */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-[#FFF8F2] border border-[rgba(255,170,80,0.2)] p-2.5 rounded-xl text-center">
                        <span className="text-[#8A8A8A] block text-[8px] uppercase font-mono">Photos</span>
                        <span className="text-sm font-bold text-[#1A1A1A]">1,247</span>
                      </div>
                      <div className="bg-[#FFF8F2] border border-[rgba(255,170,80,0.2)] p-2.5 rounded-xl text-center">
                        <span className="text-[#8A8A8A] block text-[8px] uppercase font-mono">Guests</span>
                        <span className="text-sm font-bold text-[#1A1A1A]">184</span>
                      </div>
                      <div className="bg-[#FFF8F2] border border-[#FB8500]/30 p-2.5 rounded-xl text-center">
                        <span className="text-[#8A8A8A] block text-[8px] uppercase font-mono">AI Status</span>
                        <span className="text-sm font-bold text-[#FB8500]">96%</span>
                      </div>
                    </div>

                    {/* Event Card */}
                    <div className="bg-[#FFF8F2] border border-[rgba(255,170,80,0.2)] p-3 rounded-xl space-y-1">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-[#1A1A1A] text-xs">Annual Fest 2026</h4>
                        <span className="text-[9px] bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                          Live
                        </span>
                      </div>
                      <p className="text-[10px] text-[#525252]">Pillai Auditorium • 4.8 GB</p>
                    </div>

                    {/* Simulation Step Box */}
                    {simState === 'organizer-active' && (
                      <div className="bg-[#FFF6EC] border-2 border-[#FB8500]/40 p-3 rounded-xl space-y-2 animate-in fade-in duration-300">
                        {uploadPercent < 50 ? (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="font-bold text-[#1A1A1A] flex items-center gap-1.5">
                                <Upload size={14} className="animate-bounce text-[#FB8500]" />
                                Step 1: Uploading Photos
                              </span>
                              <span className="font-mono font-bold text-[#FB8500] text-[10px]">
                                {Math.min(1247, Math.floor((uploadPercent / 50) * 1247))} / 1,247
                              </span>
                            </div>
                            <div className="border border-dashed border-[#FB8500] rounded-lg p-2 bg-white text-center space-y-1">
                              <span className="text-[10px] font-bold text-[#1A1A1A] block">DSLR_EVENT_BATCH.zip</span>
                              <div className="w-full h-2 bg-[#FFF8F2] rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-[#FFB703] to-[#FB8500] rounded-full transition-all duration-300" style={{ width: `${(uploadPercent / 50) * 100}%` }} />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="font-bold text-emerald-600 flex items-center gap-1">
                                <Sparkles size={13} className="animate-spin text-emerald-500" />
                                Step 2: AI Face Vector Mapping
                              </span>
                              <span className="font-mono font-bold text-[#1A1A1A] text-[10px]">{uploadPercent}%</span>
                            </div>
                            <div className="w-full h-2 bg-white rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-[#FFB703] to-emerald-500 rounded-full transition-all duration-300" style={{ width: `${uploadPercent}%` }} />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {simState === 'generate-qr' && (
                      <div className="bg-[#FFF8F2] border border-[#FB8500]/30 p-3 rounded-xl flex items-center justify-between animate-in fade-in duration-300">
                        <div>
                          <h5 className="font-bold text-[#1A1A1A] text-xs">Event QR Code Ready</h5>
                          <p className="text-[10px] text-[#525252]">Guests scanning QR code...</p>
                        </div>
                        <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center p-1 border border-[rgba(255,170,80,0.2)]">
                          <QrCode size={26} className="text-[#1A1A1A]" />
                        </div>
                      </div>
                    )}

                    {/* Table */}
                    <div className="bg-[#FFF8F2] border border-[rgba(255,170,80,0.2)] rounded-xl p-3 space-y-1.5">
                      <span className="text-[9px] font-bold text-[#8A8A8A] uppercase">Recent Uploads</span>
                      <div className="space-y-1 text-[10px] font-mono text-[#525252]">
                        <div className="flex justify-between items-center">
                          <span>IMG_1204.jpg</span>
                          <span className="text-emerald-600 font-bold">Done</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>IMG_1205.jpg</span>
                          <span className="text-emerald-600 font-bold">Done</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* MOBILE GUEST PANEL */}
              <div className="w-1/2 pl-2">
                <div className={`w-full rounded-[28px] border-2 bg-white shadow-xl overflow-hidden transition-all duration-300 flex flex-col h-[520px] relative ${activeTab === 'guest' ? 'border-[#FF6B6B] shadow-[#FF6B6B]/15' : 'border-[rgba(255,170,80,0.2)]'}`}>
                  {/* Browser bar */}
                  <div className="bg-[#FFF8F2] px-4 py-3 flex items-center justify-between border-b border-[rgba(255,170,80,0.15)] shrink-0">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#E63946]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#FFB703]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
                    </div>
                    <div className="bg-white px-3 py-0.5 rounded-full text-[10px] font-mono text-[#8A8A8A] border border-[rgba(255,170,80,0.2)] max-w-[200px] truncate text-center">
                      photoshare.ai/guest
                    </div>
                    <div className="w-8" />
                  </div>

                  {/* Guest Content */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-white text-xs">
                    <div className="bg-[#FFF8F2] border border-[rgba(255,170,80,0.2)] p-3 rounded-xl space-y-0.5">
                      <h4 className="font-bold text-[#1A1A1A] text-xs">Welcome, Akash</h4>
                      <span className="text-[10px] text-[#FF6B6B] font-bold block">Joined Annual Fest 2026</span>
                    </div>

                    {(simState === 'guest-active' || simState === 'upload-selfie') && (
                      <div className="bg-[#FFF6EC] border border-[#FF6B6B]/30 p-4 rounded-xl text-center space-y-2 animate-in fade-in duration-300 flex flex-col items-center">
                        <span className="text-[10px] font-bold text-[#FF6B6B] uppercase">Guest Selfie Key</span>
                        {simState === 'guest-active' ? (
                          <button onClick={startSimulation} className="h-9 px-5 bg-gradient-to-r from-[#FFB703] to-[#FB8500] text-white rounded-full flex items-center justify-center text-[11px] font-bold shadow-md shadow-[#FB8500]/20">
                            Upload Selfie
                          </button>
                        ) : (
                          <div className="space-y-1">
                            <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-[#FB8500] relative mx-auto shadow-md">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" alt="Selfie preview" className="h-full w-full object-cover animate-pulse" />
                            </div>
                            <span className="text-[9px] text-[#525252] font-semibold block">selfie_akash.jpg</span>
                          </div>
                        )}
                      </div>
                    )}

                    {simState === 'searching' && (
                      <div className="bg-[#FFF6EC] border border-[#FF6B6B]/30 p-4 rounded-xl space-y-2 animate-in fade-in duration-300">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-bold text-[#FF6B6B]">AI Face Matching...</span>
                          <span className="font-bold text-[#1A1A1A]">{aiPercent}%</span>
                        </div>
                        <div className="w-full h-2 bg-white rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#FFB703] to-[#FF6B6B] rounded-full transition-all duration-300" style={{ width: `${aiPercent}%` }} />
                        </div>
                      </div>
                    )}

                    {simState === 'completed' && (
                      <div className="space-y-3 animate-in fade-in duration-500">
                        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="text-[9px] font-bold text-emerald-600 uppercase block">Gallery Unlocked</span>
                            <h5 className="font-bold text-[#1A1A1A] text-xs">126 Photos Found</h5>
                          </div>
                          <button className="bg-[#FF6B6B] text-white font-bold text-[10px] h-7 px-3 rounded-full flex items-center gap-1 shadow-sm">
                            <Download size={10} /> Download
                          </button>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          {MATCHED_IMAGES.slice(0, 3).map((img, i) => (
                            <div key={i} className="aspect-square rounded-lg overflow-hidden border border-[rgba(255,170,80,0.2)] relative shadow-sm">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={img} alt="Matched pic" className="h-full w-full object-cover" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DESKTOP SIDE-BY-SIDE PANELS (>= 1024px) */}
          <div className="hidden lg:grid grid-cols-2 gap-10 max-w-7xl w-full items-stretch pt-4">

            {/* ORGANIZER SAAS DASHBOARD */}
            <div className={`w-full rounded-[28px] border-2 bg-white shadow-xl overflow-hidden transition-all duration-500 flex flex-col h-[540px] relative ${activeTab === 'organizer' ? 'border-[#FB8500] shadow-[#FB8500]/15 scale-[1.01] opacity-100' : 'border-[rgba(255,170,80,0.2)] opacity-60 scale-[0.99]'}`}>

              {/* Browser bar */}
              <div className="bg-[#FFF8F2] px-5 py-3.5 flex items-center justify-between border-b border-[rgba(255,170,80,0.15)] shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#E63946]" />
                  <div className="w-3 h-3 rounded-full bg-[#FFB703]" />
                  <div className="w-3 h-3 rounded-full bg-[#22C55E]" />
                </div>
                <div className="bg-white px-4 py-1 rounded-full text-[11px] font-mono text-[#8A8A8A] border border-[rgba(255,170,80,0.2)] max-w-[240px] truncate w-full text-center">
                  photoshare.ai/organizer/dashboard
                </div>
                <div className="w-12" />
              </div>

              {/* Dashboard Layout */}
              <div className="flex-1 flex overflow-hidden text-xs">
                {/* Sidebar */}
                <div className="hidden sm:flex w-44 border-r border-[rgba(255,170,80,0.15)] bg-[#FFF8F2] p-4 flex-col justify-between shrink-0">
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-wider block px-2">Navigation</span>
                    <ul className="space-y-1.5 text-[#525252]">
                      <li className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white text-[#FB8500] font-bold shadow-sm border border-[rgba(255,170,80,0.2)]">
                        <LayoutDashboard size={16} /> Dashboard
                      </li>
                      <li className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-white/60">
                        <Layers size={16} /> Events
                      </li>
                      <li className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-white/60">
                        <Users size={16} /> Guests
                      </li>
                      <li className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-white/60">
                        <Upload size={16} /> Uploads
                      </li>
                    </ul>
                  </div>
                  <div className="border-t border-[rgba(255,170,80,0.2)] pt-3">
                    <span className="text-xs font-bold text-[#1A1A1A] block px-2">Rahul (Admin)</span>
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-white">
                  {/* Top Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-[#FFF8F2] border border-[rgba(255,170,80,0.2)] p-3 rounded-2xl">
                      <span className="text-[#8A8A8A] block text-[9px] uppercase font-mono">Photos</span>
                      <span className="text-base font-bold text-[#1A1A1A]">1,247</span>
                    </div>
                    <div className="bg-[#FFF8F2] border border-[rgba(255,170,80,0.2)] p-3 rounded-2xl">
                      <span className="text-[#8A8A8A] block text-[9px] uppercase font-mono">Guests</span>
                      <span className="text-base font-bold text-[#1A1A1A]">184</span>
                    </div>
                    <div className="bg-[#FFF8F2] border border-[#FB8500]/30 p-3 rounded-2xl">
                      <span className="text-[#8A8A8A] block text-[9px] uppercase font-mono">AI Progress</span>
                      <span className="text-base font-bold text-[#FB8500]">96%</span>
                    </div>
                  </div>

                  {/* Event Information Card */}
                  <div className="bg-[#FFF8F2] border border-[rgba(255,170,80,0.2)] p-4 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-[#1A1A1A]">College Annual Fest 2026</h4>
                      <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-bold">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" /> Live
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[#525252] text-[11px]">
                      <span>Venue: Pillai College Auditorium</span>
                      <span>Storage Used: 4.8 GB</span>
                    </div>
                  </div>

                  {/* Dynamic Simulation view content - Organizer Host Upload & Processing */}
                  {simState === 'organizer-active' && (
                    <div className="bg-[#FFF6EC] border-2 border-[#FB8500]/40 p-4 rounded-2xl space-y-3 animate-in fade-in duration-300 shadow-sm">
                      {uploadPercent < 50 ? (
                        /* Phase 1: Host Uploading Event Photos Batch */
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-serif-display font-extrabold text-sm text-[#1A1A1A] flex items-center gap-2">
                              <Upload size={16} className="animate-bounce text-[#FB8500]" />
                              Step 1: Host Uploading Event Photos Batch
                            </span>
                            <span className="font-mono font-extrabold text-xs text-[#FB8500] bg-white px-2.5 py-1 rounded-full border border-[rgba(255,170,80,0.3)] shadow-xs">
                              {Math.min(1247, Math.floor((uploadPercent / 50) * 1247))} / 1,247 photos
                            </span>
                          </div>

                          {/* Host Upload Dropzone Box Graphic */}
                          <div className="border-2 border-dashed border-[#FB8500] rounded-xl p-3.5 bg-white text-center space-y-2 shadow-xs">
                            <div className="flex justify-center items-center gap-2">
                              <span className="text-xs font-serif-display font-extrabold text-[#1A1A1A]">DSLR_EVENT_BATCH_2026.zip</span>
                              <span className="text-[10px] bg-[#FB8500] text-white font-extrabold px-2.5 py-0.5 rounded-full shadow-xs">Uploading</span>
                            </div>
                            <div className="w-full h-2.5 bg-[#FFF8F2] rounded-full overflow-hidden border border-[rgba(255,170,80,0.2)]">
                              <div className="h-full bg-gradient-to-r from-[#FFB703] to-[#FB8500] rounded-full transition-all duration-300" style={{ width: `${(uploadPercent / 50) * 100}%` }} />
                            </div>
                            <p className="text-xs font-bold text-[#1A1A1A]">Host transferring 1,247 high-res DSLR photos to event vault...</p>
                          </div>
                        </div>
                      ) : (
                        /* Phase 2: AI Face Vector Mapping */
                        <div className="space-y-2.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-emerald-600 flex items-center gap-1.5">
                              <Sparkles size={14} className="animate-spin text-emerald-500" />
                              Step 2: AI Face Vector Mapping & Indexing
                            </span>
                            <span className="font-mono font-bold text-[#1A1A1A]">{uploadPercent}%</span>
                          </div>
                          <div className="w-full h-2.5 bg-white rounded-full overflow-hidden border border-[rgba(255,170,80,0.2)]">
                            <div className="h-full bg-gradient-to-r from-[#FFB703] via-[#FB8500] to-emerald-500 rounded-full transition-all duration-300" style={{ width: `${uploadPercent}%` }} />
                          </div>
                          <p className="text-[10px] text-[#525252]">Generating 512-D face embeddings on 1,247 photos...</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Share Card step */}
                  {simState === 'generate-qr' && (
                    <div className="bg-[#FFF8F2] border border-[#FB8500]/30 p-4 rounded-2xl flex items-center justify-between animate-in fade-in duration-300">
                      <div className="space-y-1">
                        <h5 className="font-bold text-[#1A1A1A]">Share QR Code</h5>
                        <p className="text-[10px] text-[#525252]">Guests join to receive matching files</p>
                      </div>
                      <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center p-1 border border-[rgba(255,170,80,0.2)] shadow-sm">
                        <QrCode size={32} className="text-[#1A1A1A]" />
                      </div>
                    </div>
                  )}

                  {/* Recent Uploads Table */}
                  <div className="bg-[#FFF8F2] border border-[rgba(255,170,80,0.2)] rounded-2xl p-4 space-y-2">
                    <span className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-wider">Recent Uploads</span>
                    <div className="space-y-2 text-[10px] font-mono text-[#525252]">
                      <div className="flex justify-between items-center border-b border-[rgba(255,170,80,0.15)] pb-1.5">
                        <span>IMG_1204.jpg</span>
                        <span className="text-emerald-600 font-bold">Completed</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-[rgba(255,170,80,0.15)] pb-1.5">
                        <span>IMG_1205.jpg</span>
                        <span className="text-emerald-600 font-bold">Completed</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>IMG_1206.jpg</span>
                        {simState === 'organizer-active' ? (
                          <span className="text-[#FB8500] font-bold animate-pulse">Processing</span>
                        ) : (
                          <span className="text-emerald-600 font-bold">Completed</span>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* GUEST SAAS DASHBOARD */}
            <div className={`w-full rounded-[28px] border-2 bg-white shadow-xl overflow-hidden transition-all duration-500 flex flex-col h-[540px] relative ${activeTab === 'guest' ? 'border-[#FF6B6B] shadow-[#FF6B6B]/15 scale-[1.01] opacity-100' : 'border-[rgba(255,170,80,0.2)] opacity-60 scale-[0.99]'}`}>

              {/* Browser bar */}
              <div className="bg-[#FFF8F2] px-5 py-3.5 flex items-center justify-between border-b border-[rgba(255,170,80,0.15)] shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#E63946]" />
                  <div className="w-3 h-3 rounded-full bg-[#FFB703]" />
                  <div className="w-3 h-3 rounded-full bg-[#22C55E]" />
                </div>
                <div className="bg-white px-4 py-1 rounded-full text-[11px] font-mono text-[#8A8A8A] border border-[rgba(255,170,80,0.2)] max-w-[240px] truncate w-full text-center">
                  photoshare.ai/guest/gallery
                </div>
                <div className="w-12" />
              </div>

              {/* Dashboard Layout */}
              <div className="flex-1 flex overflow-hidden text-xs">
                {/* Sidebar */}
                <div className="hidden sm:flex w-44 border-r border-[rgba(255,170,80,0.15)] bg-[#FFF8F2] p-4 flex-col justify-between shrink-0">
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-wider block px-2">Gallery</span>
                    <ul className="space-y-1.5 text-[#525252]">
                      <li className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white text-[#FF6B6B] font-bold shadow-sm border border-[rgba(255,170,80,0.2)]">
                        <ImageIcon size={16} /> My Gallery
                      </li>
                      <li className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-white/60">
                        <Download size={16} /> Downloads
                      </li>
                      <li className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-white/60">
                        <Layers size={16} /> Events
                      </li>
                      <li className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-white/60">
                        <Settings size={16} /> Settings
                      </li>
                    </ul>
                  </div>
                  <div className="border-t border-[rgba(255,170,80,0.2)] pt-3">
                    <span className="text-xs font-bold text-[#1A1A1A] block px-2">Akash (Guest)</span>
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-white">

                  {/* Top Welcome Card */}
                  <div className="bg-[#FFF8F2] border border-[rgba(255,170,80,0.2)] p-4 rounded-2xl space-y-1">
                    <h4 className="font-bold text-[#1A1A1A]">Welcome back, Akash</h4>
                    <span className="text-[11px] text-[#FF6B6B] font-bold block">Joined College Annual Fest 2026</span>
                  </div>

                  {/* Step 4 & 5: QR Scanning / Upload Selfie */}
                  {(simState === 'guest-active' || simState === 'upload-selfie') && (
                    <div className="bg-[#FFF6EC] border border-[#FF6B6B]/30 p-5 rounded-2xl text-center space-y-3 animate-in fade-in duration-300 flex flex-col items-center">
                      <span className="text-xs font-bold text-[#FF6B6B] uppercase">Select Selfie File</span>
                      {simState === 'guest-active' ? (
                        <button onClick={startSimulation} className="h-11 px-6 bg-gradient-to-r from-[#FFB703] to-[#FB8500] text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md shadow-[#FB8500]/20 cursor-pointer hover:scale-[1.02] transition-transform">
                          Upload Selfie
                        </button>
                      ) : (
                        <div className="space-y-2">
                          {/* Selfie upload preview */}
                          <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-[#FB8500] relative mx-auto shadow-md">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" alt="Selfie preview" className="h-full w-full object-cover animate-pulse" />
                          </div>
                          <span className="text-[10px] text-[#525252] font-semibold block">selfie_akash.jpg selected</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 6: Searching & Scanning */}
                  {simState === 'searching' && (
                    <div className="bg-[#FFF6EC] border border-[#FF6B6B]/30 p-5 rounded-2xl space-y-3 animate-in fade-in duration-300">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-[#FF6B6B]">Matching faces in 1,247 files...</span>
                        <span className="font-bold text-[#1A1A1A]">{aiPercent}%</span>
                      </div>
                      <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-[rgba(255,170,80,0.2)]">
                        <div className="h-full bg-gradient-to-r from-[#FFB703] to-[#FF6B6B] rounded-full transition-all duration-300" style={{ width: `${aiPercent}%` }} />
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[10px] text-[#8A8A8A]">
                        <span className="text-[#FF6B6B] font-bold">✔ Detected</span>
                        <span className={aiPercent >= 50 ? 'text-[#FF6B6B] font-bold' : ''}>Matching...</span>
                        <span className={aiPercent >= 100 ? 'text-emerald-600 font-bold' : ''}>Gallery Ready</span>
                      </div>
                    </div>
                  )}

                  {/* Step 7: Completed Grid */}
                  {simState === 'completed' && (
                    <div className="space-y-4 animate-in fade-in duration-500">
                      <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold text-emerald-600 uppercase">Private Gallery Unlocked</span>
                          <h5 className="font-bold text-[#1A1A1A]">126 Photos Found</h5>
                        </div>
                        <button className="bg-[#FF6B6B] text-white hover:bg-[#FF6B6B]/90 font-bold text-xs h-8 px-4 rounded-full flex items-center gap-1.5 shadow-sm">
                          <Download size={12} /> Download All
                        </button>
                      </div>

                      {/* Matched Grid */}
                      <div className="grid grid-cols-3 gap-2.5">
                        {MATCHED_IMAGES.slice(0, 3).map((img, i) => (
                          <div key={i} className="aspect-square rounded-xl overflow-hidden border border-[rgba(255,170,80,0.2)] relative group shadow-sm">
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
        <section className="px-6 py-24 max-w-7xl mx-auto w-full bg-[#FFFDF8]">
          <div className="text-center space-y-4 mb-20">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E63946] bg-rose-50 px-4 py-1.5 rounded-full border border-rose-200 inline-flex items-center gap-1.5">
              <Shield size={14} /> The Privacy Comparison
            </span>
            <h2 className="text-4xl sm:text-5xl font-serif-display text-[#1A1A1A]">Only You Can See Your Photos.</h2>
            <p className="text-[#525252] max-w-xl mx-auto text-lg">
              Traditional shared albums expose everyone&apos;s memories. PhotoShare creates a private gallery for every guest.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto items-stretch">

            {/* Left: Traditional Shared Album */}
            <div className="card-luxury p-10 flex flex-col justify-between border-rose-200 hover:border-rose-300">
              <div className="space-y-4">
                <h3 className="text-base font-bold text-[#E63946] flex items-center gap-2 uppercase tracking-wider">
                  <AlertCircle size={18} /> Traditional Shared Album
                </h3>
                <p className="text-sm text-[#525252] leading-[1.7]">
                  Host uploads everything to a central directory (Google Drive/Dropbox). Anyone with the link can view, download, and browse everyone else&apos;s private moments.
                </p>
              </div>

              {/* Diagram */}
              <div className="bg-[#FFF8F2] rounded-2xl p-5 mt-8 border border-rose-100 space-y-4 text-center">
                <span className="text-[11px] text-[#8A8A8A] uppercase font-mono font-bold">Everything Visible to All</span>
                <div className="flex justify-around items-center pt-2">
                  <div className="text-xs bg-white border border-[rgba(255,170,80,0.2)] p-3 rounded-xl text-[#525252] font-semibold">
                    Host Link
                  </div>
                  <div className="text-[#8A8A8A]">→</div>
                  <div className="text-xs bg-rose-100 border border-rose-200 p-3 rounded-xl text-[#E63946] font-bold">
                    All 1,200 Photos Public ❌
                  </div>
                </div>
              </div>
            </div>

            {/* Right: PhotoShare AI */}
            <div className="card-luxury p-10 flex flex-col justify-between border-[rgba(255,170,80,0.3)] shadow-lg shadow-[#FB8500]/5">
              <div className="space-y-4">
                <h3 className="text-base font-bold text-[#FB8500] flex items-center gap-2 uppercase tracking-wider">
                  <ShieldCheck size={18} /> PhotoShare AI Secure Flow
                </h3>
                <p className="text-sm text-[#525252] leading-[1.7]">
                  AI scans the uploads. Guests submit a selfie which acts as a decryption key to unlock only matching files.
                </p>
              </div>

              {/* Diagram */}
              <div className="bg-[#FFF8F2] rounded-2xl p-5 mt-8 border border-[rgba(255,170,80,0.2)] space-y-4">
                <div className="flex justify-between items-center text-[10px] text-[#8A8A8A] uppercase font-mono px-1">
                  <span>Secure Segmented Output</span>
                  <span className="text-emerald-600 font-bold">🔒 Private</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-[rgba(255,170,80,0.2)]">
                    <span className="text-[#1A1A1A] font-semibold">Guest A Selfie</span>
                    <span className="text-emerald-600 font-bold">A&apos;s Photos Only 🔒</span>
                  </div>
                  <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-[rgba(255,170,80,0.2)]">
                    <span className="text-[#1A1A1A] font-semibold">Guest B Selfie</span>
                    <span className="text-emerald-600 font-bold">B&apos;s Photos Only 🔒</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/50 p-3 rounded-xl border border-dashed border-[rgba(255,170,80,0.2)] opacity-60">
                    <span className="text-[#8A8A8A]">Host Dashboard</span>
                    <span className="text-[#FB8500] font-bold">Manage Event Only</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Section Final CTA */}
        <section className="px-6 py-28 bg-gradient-to-br from-[#FFFDF8] via-[#FFF8F2] to-[#FFF6EC] border-t border-[rgba(255,170,80,0.15)] text-center relative overflow-hidden flex flex-col items-center">
          <div className="max-w-3xl mx-auto space-y-8 relative z-10">
            <h2 className="text-4xl sm:text-6xl font-serif-display text-[#1A1A1A] leading-tight">
              Ready to Find Every Photo You&apos;re In?
            </h2>
            <p className="text-lg text-[#525252] max-w-lg mx-auto">
              Upload once. Share once. Let AI handle the rest.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center pt-4 w-full max-w-md mx-auto sm:max-w-none">
              <Link href="/auth/sign-up" className="w-full sm:w-auto">
                <button className="btn-primary-luxury w-full sm:w-auto text-base">
                  Create Your First Event
                </button>
              </Link>
              <Link href="/auth/sign-in" className="w-full sm:w-auto">
                <button className="btn-secondary-luxury w-full sm:w-auto text-base">
                  Sign In
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="h-20 border-t border-[rgba(255,170,80,0.12)] flex items-center justify-center text-xs text-[#8A8A8A] bg-[#FFFDF8] shrink-0 font-medium">
        © 2026 PhotoShare AI. All rights reserved. Designed for event memories.
      </footer>
    </div>
  );
}
