// app/profile/page.tsx
// User Profile Page View (Protected).

'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, User, Calendar, Mail, Edit3 } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/loading-spinner';

export default function ProfilePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  if (!user) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation Head */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <ArrowLeft size={16} />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Profile Card */}
        <Card className="shadow-md border border-zinc-200/50 dark:border-zinc-800/50">
          <CardHeader className="relative pb-10">
            <div className="absolute top-0 left-0 w-full h-32 bg-zinc-900 dark:bg-zinc-800 rounded-t-xl" />
            <div className="relative pt-12 flex flex-col sm:flex-row items-center gap-6 sm:items-end justify-between px-2">
              <Avatar className="h-24 w-24 border-4 border-white dark:border-zinc-950 shadow-md">
                <AvatarImage src={user.image || undefined} alt={user.name} />
                <AvatarFallback className="text-xl bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left space-y-1">
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{user.name}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Platform Member</p>
              </div>
              <Button disabled variant="outline" className="flex items-center gap-2 mt-4 sm:mt-0">
                <Edit3 size={16} />
                Edit Profile
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            <CardTitle className="text-lg">Account Information</CardTitle>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex items-center gap-3 p-4 bg-zinc-100/50 dark:bg-zinc-900/50 rounded-lg">
                <Mail className="text-zinc-400" size={20} />
                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Email address</p>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-zinc-100/50 dark:bg-zinc-900/50 rounded-lg">
                <Calendar className="text-zinc-400" size={20} />
                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Member since</p>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    {formatDate(user.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
