// components/events/edit-event-dialog.tsx
// Dialog form to edit an existing event's metadata.

'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { updateEventSchema, UpdateEventInput } from '@/schemas/event.schema';
import { SubmitButton } from '../submit-button';
import { Event } from '@/types/event';

interface EditEventDialogProps {
  event: Event;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateSuccess: () => void;
}

export function EditEventDialog({ event, open, onOpenChange, onUpdateSuccess }: EditEventDialogProps) {
  const [loading, setLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateEventInput>({
    resolver: zodResolver(updateEventSchema),
    defaultValues: {
      name: event.name,
      description: event.description || '',
    },
  });

  // Keep form updated with event changes
  React.useEffect(() => {
    if (open && event) {
      reset({
        name: event.name,
        description: event.description || '',
      });
    }
  }, [open, event, reset]);

  const onSubmit = async (data: UpdateEventInput) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to update event');
      }

      toast.success('Event updated successfully!');
      onUpdateSuccess();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Event Settings</DialogTitle>
          <DialogDescription>
            Modify event name and description details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Event Name</Label>
            <Input
              id="edit-name"
              placeholder="e.g. Wedding, College Road Trip"
              disabled={loading}
              className={errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs font-medium text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description (Optional)</Label>
            <Textarea
              id="edit-description"
              placeholder="Provide a short description of the event..."
              disabled={loading}
              className={errors.description ? 'border-red-500 focus-visible:ring-red-500' : ''}
              rows={4}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-xs font-medium text-red-500">{errors.description.message}</p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <SubmitButton loading={loading}>Save Changes</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
