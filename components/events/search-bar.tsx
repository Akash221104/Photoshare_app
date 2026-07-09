// components/events/search-bar.tsx
// Search bar and join code submission panel.

'use client';

import React from 'react';
import { Search, KeyRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { joinEventSchema } from '@/schemas/event.schema';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function SearchBar({ searchQuery, setSearchQuery }: SearchBarProps) {
  const router = useRouter();
  const [joinCode, setJoinCode] = React.useState('');
  const [joining, setJoining] = React.useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    const validation = joinEventSchema.safeParse({ joinCode: joinCode.trim() });
    if (!validation.success) {
      toast.error(validation.error.issues[0].message);
      return;
    }

    setJoining(true);
    // Redirect to the invite page which handles authorization checks and database insertion
    router.push(`/invite/${joinCode.toUpperCase()}`);
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
        <Input
          type="text"
          placeholder="Search events by name..."
          className="pl-9 h-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Join Code Input Form */}
      <form onSubmit={handleJoin} className="flex items-center gap-2">
        <div className="relative w-44">
          <KeyRound className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
          <Input
            type="text"
            placeholder="Enter Join Code"
            maxLength={10}
            className="pl-9 h-9 uppercase font-semibold tracking-wider"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            disabled={joining}
          />
        </div>
        <Button type="submit" size="sm" className="h-9" disabled={joining}>
          {joining ? 'Joining...' : 'Join Event'}
        </Button>
      </form>
    </div>
  );
}
