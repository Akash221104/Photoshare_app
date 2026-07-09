// app/page.tsx
// Marketing Landing Page. Displays call to actions for Login and Registration.

import Link from 'next/link';
import { Camera, ArrowRight, ShieldCheck, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'AI-Powered Event Photo Share',
  description: 'Instantly find and share photos matching your face across multiple events.',
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 overflow-hidden">
      {/* Decorative Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Header / Navbar */}
      <header className="flex h-16 items-center justify-between px-6 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center">
            <Camera size={18} className="text-white dark:text-black" />
          </div>
          <span className="text-lg font-bold tracking-tight">EventPhoto</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/auth/sign-in">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/auth/sign-up">
            <Button className="shadow-md">Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center max-w-4xl mx-auto z-10 space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm text-xs font-semibold text-zinc-600 dark:text-zinc-400">
          <Sparkles size={12} className="text-amber-500 animate-pulse" />
          AI-Powered Face Matching Engine
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-500 dark:from-zinc-50 dark:via-zinc-300 dark:to-zinc-500 bg-clip-text text-transparent">
          Event Photo Sharing, <br />
          Simplified by AI
        </h1>

        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl">
          Tired of scrolling through thousands of photos to find yourself? Upload one selfie, and our AI automatically creates your personalized gallery from any event.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/sign-up">
            <Button size="lg" className="h-12 px-8 text-base shadow-lg flex items-center gap-2">
              Create Free Account
              <ArrowRight size={18} />
            </Button>
          </Link>
          <Link href="/auth/sign-in">
            <Button size="lg" variant="outline" className="h-12 px-8 text-base">
              Explore Dashboard
            </Button>
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid gap-6 mt-16 sm:grid-cols-3 max-w-4xl w-full text-left pt-12 border-t border-zinc-200/50 dark:border-zinc-800/50">
          <div className="space-y-2">
            <div className="h-10 w-10 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
              <ShieldCheck className="text-zinc-900 dark:text-zinc-100" size={22} />
            </div>
            <h3 className="font-bold text-lg">Secure & Private</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Only see photos containing your face. Your privacy is protected with secure session management.
            </p>
          </div>

          <div className="space-y-2">
            <div className="h-10 w-10 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
              <Sparkles className="text-zinc-900 dark:text-zinc-100" size={22} />
            </div>
            <h3 className="font-bold text-lg">Instant Face Matching</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Vector search checks hundreds of uploads instantly. Spot yourself without scrolling.
            </p>
          </div>

          <div className="space-y-2">
            <div className="h-10 w-10 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
              <ImageIcon className="text-zinc-900 dark:text-zinc-100" size={22} />
            </div>
            <h3 className="font-bold text-lg">High-Quality CDN</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Photos are optimized and served globally with compression and low-latency storage.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-16 flex items-center justify-center border-t border-zinc-200/50 dark:border-zinc-800/50 text-xs text-zinc-500 z-10 shrink-0">
        © 2026 EventPhoto. Designed by DeepMind team. All rights reserved.
      </footer>
    </div>
  );
}
