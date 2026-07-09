// components/events/host-dashboard.tsx
// Privacy-first host dashboard: shows ONLY aggregate event metrics.
// No individual photo access. No member gallery visibility.

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Image as ImageIcon, Cpu, CheckCircle2, Clock, AlertCircle,
  RefreshCw, Sparkles, Camera, Activity, Zap, BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LoadingSpinner } from '@/components/loading-spinner';

interface EventStats {
  totalPhotos: number;
  processedPhotos: number;
  pendingPhotos: number;
  processingPhotos: number;
  failedPhotos: number;
  totalFaces: number;
  memberCount: number;
  selfieCount: number;
  pipelineHealth: number;
}

interface HostDashboardProps {
  eventId: string;
}

export function HostDashboard({ eventId }: HostDashboardProps) {
  const [stats, setStats] = useState<EventStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(`/api/events/${eventId}/stats`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to load event statistics');
      }
      const data = await res.json();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch stats');
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  }, [eventId]);

  // Retry failed AI jobs
  const retryFailedJobs = async () => {
    setRetrying(true);
    try {
      await fetch(`/api/photos/retry?eventId=${eventId}`, { method: 'POST' });
      // Refresh stats after triggering retry
      await fetchStats();
    } catch {
      setRetrying(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Auto-refresh stats every 30s if there are pending/processing photos
    const interval = setInterval(() => {
      if (stats && (stats.pendingPhotos > 0 || stats.processingPhotos > 0)) {
        fetchStats();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchStats, stats?.pendingPhotos, stats?.processingPhotos]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[280px] gap-4">
        <LoadingSpinner size={28} />
        <p className="text-xs text-muted-foreground">Loading event metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[220px] gap-4 text-center">
        <AlertCircle className="w-10 h-10 text-red-500/80" />
        <p className="text-sm font-semibold text-red-500">{error}</p>
        <Button onClick={fetchStats} variant="outline" size="sm" className="gap-1.5 text-xs">
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </Button>
      </div>
    );
  }

  if (!stats) return null;

  const isQueueBusy = stats.pendingPhotos > 0 || stats.processingPhotos > 0;
  const healthColor =
    stats.pipelineHealth >= 90 ? 'text-emerald-500' :
    stats.pipelineHealth >= 60 ? 'text-amber-500' : 'text-red-500';

  return (
    <div className="space-y-6">
      {/* Host Privacy Notice */}
      <div className="flex items-start gap-3 bg-blue-500/5 border border-blue-500/15 rounded-xl p-4 text-xs">
        <div className="bg-blue-500/10 p-2 rounded-full mt-0.5 shrink-0">
          <Zap className="w-3.5 h-3.5 text-blue-500" />
        </div>
        <div className="space-y-1">
          <p className="font-bold text-blue-600 dark:text-blue-400">Host Dashboard – Aggregate View Only</p>
          <p className="text-muted-foreground leading-relaxed">
            As the host, you see only aggregated event metrics below. Individual photo uploads and personal galleries are private to each member — only they can view their own content.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Members */}
        <Card className="border border-muted/40 bg-card/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Members</p>
              <div className="bg-violet-500/10 p-1.5 rounded-full">
                <Users className="w-3.5 h-3.5 text-violet-500" />
              </div>
            </div>
            <h3 className="text-2xl font-black">{stats.memberCount}</h3>
            <p className="text-[10px] text-muted-foreground">
              {stats.selfieCount} have uploaded a selfie for AI search
            </p>
          </CardContent>
        </Card>

        {/* Total Photos */}
        <Card className="border border-muted/40 bg-card/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Photos</p>
              <div className="bg-indigo-500/10 p-1.5 rounded-full">
                <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
              </div>
            </div>
            <h3 className="text-2xl font-black">{stats.totalPhotos}</h3>
            <p className="text-[10px] text-muted-foreground">
              {stats.processedPhotos} successfully AI processed
            </p>
          </CardContent>
        </Card>

        {/* Faces Detected */}
        <Card className="border border-muted/40 bg-card/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Faces Indexed</p>
              <div className="bg-emerald-500/10 p-1.5 rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              </div>
            </div>
            <h3 className="text-2xl font-black">{stats.totalFaces}</h3>
            <p className="text-[10px] text-muted-foreground">512D embeddings stored in PGVector</p>
          </CardContent>
        </Card>

        {/* Pipeline Health */}
        <Card className="border border-muted/40 bg-card/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">AI Pipeline</p>
              <div className="bg-amber-500/10 p-1.5 rounded-full">
                <Activity className="w-3.5 h-3.5 text-amber-500" />
              </div>
            </div>
            <h3 className={`text-2xl font-black ${healthColor}`}>{stats.pipelineHealth}%</h3>
            <p className="text-[10px] text-muted-foreground">photos successfully processed</p>
          </CardContent>
        </Card>
      </div>

      {/* Processing Pipeline Status */}
      <Card className="border border-muted/40 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Cpu className="w-4 h-4 text-primary" />
            AI Processing Queue
            {isQueueBusy && (
              <span className="flex items-center gap-1 ml-2 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] px-2 py-0.5 rounded-full animate-pulse">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                Active
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>Processing Progress</span>
              <span className="font-mono font-bold">{stats.processedPhotos}/{stats.totalPhotos} photos</span>
            </div>
            <Progress
              value={stats.totalPhotos > 0 ? (stats.processedPhotos / stats.totalPhotos) * 100 : 100}
              className="h-2 bg-muted"
            />
          </div>

          {/* Status Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="flex items-center gap-2 p-2.5 bg-emerald-500/5 border border-emerald-500/15 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{stats.processedPhotos}</p>
                <p className="text-[10px] text-muted-foreground">Completed</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2.5 bg-amber-500/5 border border-amber-500/15 rounded-lg">
              <Clock className="w-4 h-4 text-amber-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-600 dark:text-amber-400">{stats.pendingPhotos}</p>
                <p className="text-[10px] text-muted-foreground">Pending</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2.5 bg-blue-500/5 border border-blue-500/15 rounded-lg">
              <Cpu className="w-4 h-4 text-blue-500 shrink-0 animate-spin" style={{ animationDuration: '3s', animationPlayState: isQueueBusy ? 'running' : 'paused' }} />
              <div>
                <p className="text-xs font-bold text-blue-600 dark:text-blue-400">{stats.processingPhotos}</p>
                <p className="text-[10px] text-muted-foreground">In Progress</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2.5 bg-red-500/5 border border-red-500/15 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-red-600 dark:text-red-400">{stats.failedPhotos}</p>
                <p className="text-[10px] text-muted-foreground">Failed</p>
              </div>
            </div>
          </div>

          {/* Retry Failed + Refresh */}
          <div className="flex items-center gap-2 pt-1">
            <Button
              onClick={fetchStats}
              variant="ghost"
              size="sm"
              className="text-xs gap-1.5 text-muted-foreground hover:text-primary h-8"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh Stats
            </Button>
            {stats.failedPhotos > 0 && (
              <Button
                onClick={retryFailedJobs}
                disabled={retrying}
                variant="outline"
                size="sm"
                className="text-xs gap-1.5 border-red-500/20 text-red-600 hover:bg-red-500/5 h-8"
              >
                {retrying ? (
                  <LoadingSpinner size={13} />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5" />
                )}
                Retry {stats.failedPhotos} Failed Jobs
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Selfie Adoption Rate */}
      {stats.memberCount > 0 && (
        <Card className="border border-muted/40 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-primary" />
                <p className="text-sm font-bold">Selfie Search Adoption</p>
              </div>
              <span className="text-xs font-bold text-primary">
                {Math.round((stats.selfieCount / stats.memberCount) * 100)}%
              </span>
            </div>
            <Progress
              value={(stats.selfieCount / stats.memberCount) * 100}
              className="h-1.5 bg-muted"
            />
            <p className="text-[11px] text-muted-foreground">
              {stats.selfieCount} of {stats.memberCount} members have set up selfie AI photo search.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
