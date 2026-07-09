// components/events/invite-link-modal.tsx
// Dialog panel to copy invite links and access codes.

'use client';

import React from 'react';
import { Copy, Check, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Event } from '@/types/event';

interface InviteLinkModalProps {
  event: Event;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteLinkModal({ event, open, onOpenChange }: InviteLinkModalProps) {
  const [copiedLink, setCopiedLink] = React.useState(false);
  const [copiedCode, setCopiedCode] = React.useState(false);

  const inviteLink = React.useMemo(() => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/invite/${event.join_code}`;
  }, [event.join_code]);

  const copyToClipboard = async (text: string, type: 'link' | 'code') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'link') {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      } else {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      }
      toast.success(`${type === 'link' ? 'Invite link' : 'Access code'} copied to clipboard!`);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LinkIcon size={20} />
            Invite Members
          </DialogTitle>
          <DialogDescription>
            Share the invite details below so guests can upload and find their photos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Access Code */}
          <div className="space-y-2">
            <Label>Access Code</Label>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={event.join_code}
                className="font-mono text-center text-lg font-bold tracking-widest bg-zinc-50 dark:bg-zinc-900 select-all"
              />
              <Button
                type="button"
                variant="outline"
                className="w-10 p-0 shrink-0"
                onClick={() => copyToClipboard(event.join_code, 'code')}
              >
                {copiedCode ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Invite Link */}
          <div className="space-y-2">
            <Label>Invite Link</Label>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={inviteLink}
                className="text-sm bg-zinc-50 dark:bg-zinc-900 select-all"
              />
              <Button
                type="button"
                variant="outline"
                className="w-10 p-0 shrink-0"
                onClick={() => copyToClipboard(inviteLink, 'link')}
              >
                {copiedLink ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
