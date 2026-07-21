// components/events/search-bar.tsx
// Search bar and join code submission panel (Luxury 18px input aesthetic).

'use client';

import React from 'react';
import { Search, KeyRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Input } from '@/components/ui/input';
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
        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[#FB8500]" />
        <Input
          type="text"
          placeholder="Search events by name..."
          className="pl-10 h-11 rounded-[18px] border-[rgba(255,170,80,0.25)] focus:border-[#FB8500] focus:ring-[#FB8500]/20 bg-[#FFFDF8] text-[#1A1A1A] placeholder:text-[#8A8A8A]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Join Code Input Form */}
      <form onSubmit={handleJoin} className="flex items-center gap-3">
        <div className="relative w-48">
          <KeyRound className="absolute left-3.5 top-3.5 h-4 w-4 text-[#FB8500]" />
          <Input
            type="text"
            placeholder="Enter Join Code"
            className="pl-10 h-11 uppercase tracking-wider font-mono text-xs rounded-[18px] border-[rgba(255,170,80,0.25)] focus:border-[#FB8500] focus:ring-[#FB8500]/20 bg-[#FFFDF8] text-[#1A1A1A] placeholder:text-[#8A8A8A]"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            maxLength={6}
          />
        </div>
        <button
          type="submit"
          disabled={joining || !joinCode.trim()}
          className="btn-primary-luxury !h-11 !px-5 !text-xs"
        >
          {joining ? 'Joining...' : 'Join Event'}
        </button>
      </form>
    </div>
  );
}
