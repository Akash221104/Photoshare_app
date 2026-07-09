// app/events/[eventId]/members/page.tsx
// Event Members Directory view. Lists members and allows host moderation.

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Users } from 'lucide-react';

import { useEvent } from '@/hooks/useEvent';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { EventBanner } from '@/components/events/event-banner';
import { EventHeader } from '@/components/events/event-header';
import { MemberCard } from '@/components/events/member-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/loading-spinner';

interface MembersPageProps {
  params: Promise<{ eventId: string }>;
}

export default function EventMembersPage({ params }: MembersPageProps) {
  const router = useRouter();
  const { eventId } = React.use(params);
  const { user } = useCurrentUser();
  const { event, members, loading, loadingMembers, error, refetchMembers, removeMember } = useEvent(eventId);

  // Load members on page mount
  React.useEffect(() => {
    if (event) {
      refetchMembers();
    }
  }, [event, refetchMembers]);

  const handleRemoveMember = async (targetUserId: string) => {
    const target = members.find((m) => m.user_id === targetUserId);
    if (!target) return;

    if (!window.confirm(`Are you sure you want to remove ${target.name} from the event?`)) return;

    try {
      await removeMember(targetUserId);
      toast.success(`${target.name} has been removed from the event workspace.`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove member');
    }
  };

  if (loading || !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
        <div className="max-w-md text-center space-y-4">
          <h2 className="text-xl font-bold text-red-500 font-sans">Access Denied</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {error || 'The requested event members could not be loaded.'}
          </p>
          <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const isHost = event.host_id === user.id;
  const userRole = isHost ? 'host' : 'guest';

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Head */}
        <div className="flex items-center">
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => router.push(`/events/${event.id}`)}>
            <ArrowLeft size={16} />
            Back to Event Workspace
          </Button>
        </div>

        {/* Cover Banner */}
        <EventBanner name={event.name} />

        {/* Workspace Controls */}
        <EventHeader event={event} role={userRole} />

        {/* Members Directory Card */}
        <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg">Members Directory</CardTitle>
              <CardDescription>
                A list of all users who have joined this sharing workspace.
              </CardDescription>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
              <Users size={16} />
              {members.length} Total
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingMembers ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size={24} />
              </div>
            ) : members.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
                No members found in directory.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {members.map((member) => (
                  <MemberCard
                    key={member.user_id}
                    member={member}
                    isHostUser={isHost}
                    currentUserId={user.id}
                    onRemove={handleRemoveMember}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
