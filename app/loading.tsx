// app/loading.tsx
// Global Loading Layout for the application.

import { LoadingSpinner } from '@/components/loading-spinner';

export default function Loading() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="text-center space-y-4">
        <LoadingSpinner size={32} className="mx-auto" />
        <p className="text-sm font-medium text-zinc-500">Loading resources...</p>
      </div>
    </div>
  );
}
