// components/gallery/gallery-skeleton.tsx
import { Card, CardContent } from "@/components/ui/card";

export function GallerySkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="overflow-hidden border border-muted bg-card animate-pulse">
          <div className="aspect-[4/3] bg-muted w-full" />
          <CardContent className="p-4 space-y-3">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
            <div className="flex justify-between items-center pt-2">
              <div className="h-3 bg-muted rounded w-1/3" />
              <div className="h-4 bg-muted rounded w-1/4" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="border border-muted animate-pulse">
          <CardContent className="p-4 space-y-2">
            <div className="h-3 bg-muted rounded w-1/3" />
            <div className="h-6 bg-muted rounded w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
