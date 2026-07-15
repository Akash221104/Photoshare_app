// app/events/[eventId]/settings/page.tsx
// Event Settings Panel (Restricted to Host/Owner).

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';

import { useEvent } from '@/hooks/useEvent';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { EventBanner } from '@/components/events/event-banner';
import { EventHeader } from '@/components/events/event-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { updateEventSchema, UpdateEventInput } from '@/schemas/event.schema';
import { DeleteEventDialog } from '@/components/events/delete-event-dialog';
import { SubmitButton } from '@/components/submit-button';
import { LoadingSpinner } from '@/components/loading-spinner';

interface SettingsPageProps {
  params: Promise<{ eventId: string }>;
}

export default function EventSettingsPage({ params }: SettingsPageProps) {
  const router = useRouter();
  const { eventId } = React.use(params);
  const { user } = useCurrentUser();
  const { event, loading, error, updateEvent } = useEvent(eventId);
  
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateEventInput>({
    resolver: zodResolver(updateEventSchema),
    defaultValues: {
      name: '',
      description: '',
      upload_mode: 'ALL',
    },
  });

  // Populate form defaults when event loads
  React.useEffect(() => {
    if (event) {
      reset({
        name: event.name,
        description: event.description || '',
        upload_mode: event.upload_mode || 'ALL',
      });
    }
  }, [event, reset]);

  const onSubmit = async (data: UpdateEventInput) => {
    setSaving(true);
    try {
      await updateEvent(data.name, data.description || null, data.upload_mode);
      toast.success('Settings saved successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
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
            {error || 'The requested event settings could not be loaded.'}
          </p>
          <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const isHost = event.host_id === user.id;

  // Authorization Guard: Only the host can view the settings panel
  if (!isHost) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
        <div className="max-w-md text-center space-y-4">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Access Forbidden</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Only the owner/host of this event can configure settings.
          </p>
          <Button onClick={() => router.push(`/events/${event.id}`)}>
            Back to Event Workspace
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Head */}
        <div className="flex items-center">
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => router.push(`/events/${event.id}`)}>
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back to Event Workspace</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </div>

        {/* Cover Banner */}
        <EventBanner name={event.name} />

        {/* Workspace Controls */}
        <EventHeader event={event} role="host" />

        {/* Form Controls */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Edit Panel */}
          <Card className="md:col-span-2 border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
            <CardHeader>
              <CardTitle>Workspace Configuration</CardTitle>
              <CardDescription>Configure basic parameters for the event workspace.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="settings-name">Event Name</Label>
                  <Input
                    id="settings-name"
                    disabled={saving}
                    className={errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}
                    {...register('name')}
                  />
                  {errors.name && (
                    <p className="text-xs font-medium text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="settings-description">Description</Label>
                  <Textarea
                    id="settings-description"
                    rows={5}
                    disabled={saving}
                    className={errors.description ? 'border-red-500 focus-visible:ring-red-500' : ''}
                    {...register('description')}
                  />
                  {errors.description && (
                    <p className="text-xs font-medium text-red-500">{errors.description.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="settings-upload-mode">Upload Permissions</Label>
                  <select
                    id="settings-upload-mode"
                    disabled={saving}
                    className="flex h-9 w-full rounded-md border border-zinc-200 bg-white dark:bg-zinc-950 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:focus-visible:ring-zinc-300"
                    {...register('upload_mode')}
                  >
                    <option value="ALL">Everyone joined can upload</option>
                    <option value="HOST_ONLY">Only the Host can upload</option>
                  </select>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t border-zinc-100 dark:border-zinc-900 pt-4">
                <Button type="button" variant="outline" onClick={() => reset()} disabled={saving}>
                  Reset
                </Button>
                <SubmitButton loading={saving} className="gap-1.5">
                  <Save size={16} />
                  Save Settings
                </SubmitButton>
              </CardFooter>
            </form>
          </Card>

          {/* Danger Zone Panel */}
          <Card className="md:col-span-1 border-red-200/50 dark:border-red-900/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-red-500">Danger Zone</CardTitle>
              <CardDescription>Actions that cannot be undone.</CardDescription>
            </CardHeader>
            <CardContent className="pt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Permanently delete this event workspace, wiping out all photographs, member mapping lists, and biometric signatures.
            </CardContent>
            <CardFooter className="pt-4 border-t border-zinc-100 dark:border-zinc-900 flex justify-end">
              <Button variant="destructive" className="w-full gap-1.5" onClick={() => setDeleteOpen(true)}>
                <Trash2 size={16} />
                Delete Workspace
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Delete Confirmation Dialog */}
        <DeleteEventDialog event={event} open={deleteOpen} onOpenChange={setDeleteOpen} />
      </div>
    </div>
  );
}
