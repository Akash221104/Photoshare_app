// app/invite/[joinCode]/page.tsx
// Server component handling user joining an event via invite links.

import React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { EventRepository } from '@/database/repositories/event.repository';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface InvitePageProps {
  params: Promise<{ joinCode: string }>;
}

const eventRepo = new EventRepository();

export default async function InvitePage({ params }: InvitePageProps) {
  const { joinCode } = await params;

  // Resolve join code to event metadata
  const event = await eventRepo.getEventByJoinCode(joinCode.toUpperCase());

  if (!event) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FFFDF8] p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border-2 border-rose-200 shadow-xl text-center space-y-6">
          <div className="h-12 w-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-xl font-bold">
            !
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-[#1A1A1A]">Invalid Invitation Code</h2>
            <p className="text-sm text-[#525252]">
              The join code was not found or is expired. Please ask the event host for a new QR code or link.
            </p>
          </div>
          <Link href="/" className="block">
            <Button className="w-full btn-primary-luxury text-xs">Return to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Redirect to Public Event Welcome Page
  redirect(`/events/${event.id}`);
}
