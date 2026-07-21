// components/auth-card.tsx
// Visual card wrapper for authentication screens (Luxury 28px aesthetic).

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
    <Card className="w-full max-w-md rounded-[28px] border border-[rgba(255,170,80,0.2)] bg-white shadow-2xl shadow-[#FB8500]/5 p-2 sm:p-4">
      <CardHeader className="space-y-2 text-center pb-6">
        <CardTitle className="text-3xl font-serif-display font-bold text-[#1A1A1A] tracking-tight">{title}</CardTitle>
        {description && (
          <CardDescription className="text-sm text-[#525252] leading-relaxed">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
      {footer && (
        <CardFooter className="flex justify-center border-t border-[rgba(255,170,80,0.15)] pt-6 text-sm text-[#8A8A8A]">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}
