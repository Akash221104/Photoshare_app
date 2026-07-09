// app/invite/[joinCode]/page.tsx
// Server component handling user joining an event via invite links.

import React from 'react';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { EventService } from '@/services/event.service';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface InvitePageProps {
  params: Promise<{ joinCode: string }>;
}

const eventService = new EventService();

export default async function InvitePage({ params }: InvitePageProps) {
  const { joinCode } = await params;

  // 1. Check if user is authenticated
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    // Redirect to sign in, preserving the redirect target path
    const callbackUrl = encodeURIComponent(`/invite/${joinCode.toUpperCase()}`);
    redirect(`/auth/sign-in?callbackUrl=${callbackUrl}`);
  }

  // 2. Authenticated user tries to join
  const response = await eventService.joinEvent(joinCode.toUpperCase(), session.user.id);

  if (!response.success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-lg text-center space-y-6">
          <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-950/20 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto text-xl font-bold">
            !
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-zinc-950 dark:text-zinc-50">Invalid Invitation Link</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {response.error || 'The join code was not found or is expired. Please ask the host for a new link.'}
            </p>
          </div>
          <Link href="/dashboard" className="block">
            <Button className="w-full">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  // 3. Join success: redirect user to the joined event gallery workspace
  redirect(`/events/${response.data.id}`);
}
