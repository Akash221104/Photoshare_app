// components/auth-card.tsx
// Visual card wrapper for authentication screens.

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface AuthCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <Card className="w-full max-w-md shadow-lg border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-md bg-white/70 dark:bg-zinc-950/70">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">{title}</CardTitle>
        {description && (
          <CardDescription className="text-zinc-500 dark:text-zinc-400">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
      {footer && (
        <CardFooter className="flex justify-center border-t border-zinc-100 dark:border-zinc-900 pt-4 text-sm text-zinc-500">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}
