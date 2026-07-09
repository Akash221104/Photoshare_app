// app/dashboard/layout.tsx
// Protected Dashboard Layout with responsive Sidebar and Navbar components.

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, User, LogOut, Menu, Settings } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LoadingSpinner } from '@/components/loading-spinner';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoading, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // If loading session, render screen-centered loading state
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center space-y-4">
          <LoadingSpinner size={32} className="mx-auto" />
          <p className="text-sm font-medium text-zinc-500">Securing your session...</p>
        </div>
      </div>
    );
  }

  // Fallback if session resolves to null (middleware should redirect, but we guard here too)
  if (!user) {
    return null;
  }

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col justify-between border-r border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="space-y-6">
        <div className="flex items-center gap-2 px-2">
          <div className="h-6 w-6 rounded-md bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center">
            <span className="text-xs font-bold text-white dark:text-black">AG</span>
          </div>
          <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            EventPhoto
          </span>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <span
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50'
                      : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50'
                  }`}
                >
                  <item.icon size={18} />
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-3 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
          onClick={signOut}
        >
          <LogOut size={18} />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-900 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 h-full">
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Navbar */}
        <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-4 md:px-6 dark:border-zinc-800 dark:bg-zinc-950 shrink-0">
          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-4">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger className="md:hidden p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 cursor-pointer">
                <Menu size={20} />
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <SidebarContent />
              </SheetContent>
            </Sheet>
            <h1 className="text-md font-bold md:hidden text-zinc-900 dark:text-zinc-50">
              EventPhoto
            </h1>
          </div>

          {/* User Account Controls */}
          <div className="ml-auto flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger className="relative h-8 w-8 rounded-full p-0 overflow-hidden outline-none cursor-pointer">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.image || undefined} alt={user.name} />
                  <AvatarFallback className="bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-zinc-900 dark:text-zinc-50">
                      {user.name}
                    </p>
                    <p className="text-xs leading-none text-zinc-500 dark:text-zinc-400">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="p-0">
                  <Link href="/profile" className="flex items-center w-full gap-2 px-2 py-1.5 cursor-pointer text-zinc-700 dark:text-zinc-300">
                    <User size={16} />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="flex items-center gap-2 text-red-500 focus:text-red-500 cursor-pointer"
                  onClick={signOut}
                >
                  <LogOut size={16} />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* View Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}
