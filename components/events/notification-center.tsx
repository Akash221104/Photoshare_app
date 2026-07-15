// components/events/notification-center.tsx
// Production-grade slide-out/popover notification center displaying progress, priority categories, and quick actions.

'use client';

import React from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Bell,
  Check,
  Trash2,
  X,
  Upload,
  Cpu,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Copy,
  Info
} from 'lucide-react';

import { useNotification } from '@/hooks/useNotification';
import { NotificationItem } from '@/context/NotificationContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    clearAll,
  } = useNotification();

  const handleCopyLink = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Link copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy link.');
    }
  };

  const formatTimeAgo = (isoString: string) => {
    const seconds = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (seconds < 10) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // Group notifications into date sections
  const grouped = React.useMemo(() => {
    const today: NotificationItem[] = [];
    const yesterday: NotificationItem[] = [];
    const earlier: NotificationItem[] = [];

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;

    notifications.forEach((item) => {
      const time = new Date(item.timestamp).getTime();
      if (time >= todayStart) {
        today.push(item);
      } else if (time >= yesterdayStart) {
        yesterday.push(item);
      } else {
        earlier.push(item);
      }
    });

    return { today, yesterday, earlier };
  }, [notifications]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'upload':
        return <Upload className="h-4 w-4 text-blue-500" />;
      case 'ai':
        return <Cpu className="h-4 w-4 text-indigo-500" />;
      case 'event':
        return <Sparkles className="h-4 w-4 text-violet-500" />;
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-zinc-500" />;
    }
  };

  const getPriorityClasses = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'border-red-500/40 bg-red-500/5 hover:bg-red-500/10 dark:border-red-500/30';
      case 'high':
        return 'border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 dark:border-amber-500/20';
      case 'medium':
        return 'border-zinc-200 bg-zinc-50/50 hover:bg-zinc-100/50 dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:bg-zinc-900/60';
      default:
        return 'border-transparent bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900/30';
    }
  };

  const hasNotifications = notifications.length > 0;

  return (
    <Popover>
      <PopoverTrigger
        className="relative h-9 w-9 rounded-full text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50 cursor-pointer flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 focus-visible:outline-none"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-zinc-950 animate-pulse" />
        )}
        <span className="sr-only">Notifications</span>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 sm:w-96 max-w-[calc(100vw-32px)] p-0 border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-xl" align="end">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 px-4 py-3 bg-zinc-50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-xs text-zinc-900 dark:text-zinc-50">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white font-bold text-[9px] px-1.5 py-0.5 rounded-full shrink-0">
                {unreadCount} unread
              </span>
            )}
          </div>
          {hasNotifications && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                className="h-7 px-2 text-[10px] text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50"
                onClick={markAllAsRead}
              >
                <Check className="h-3 w-3 mr-1" />
                Mark read
              </Button>
              <Button
                variant="ghost"
                className="h-7 px-2 text-[10px] text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                onClick={clearAll}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </div>
          )}
        </div>

        {/* Scrollable list */}
        <ScrollArea className="max-h-[420px] overflow-y-auto">
          {!hasNotifications ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="bg-zinc-100 dark:bg-zinc-900 p-3 rounded-full mb-3">
                <Bell className="h-5 w-5 text-zinc-400" />
              </div>
              <h4 className="font-semibold text-xs text-zinc-900 dark:text-zinc-50">All caught up!</h4>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 max-w-[220px]">
                No new notifications. We'll alert you here when upload sessions or face-matching events finish.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-900">
              {/* Group Rendering Helper */}
              {Object.entries(grouped).map(([key, list]) => {
                if (list.length === 0) return null;
                const groupTitle = key === 'today' ? 'Today' : key === 'yesterday' ? 'Yesterday' : 'Earlier';

                return (
                  <div key={key} className="p-1">
                    <div className="px-3 py-1.5 text-[9px] uppercase tracking-wider font-bold text-zinc-400 dark:text-zinc-500">
                      {groupTitle}
                    </div>
                    <div className="space-y-1">
                      {list.map((item) => {
                        const isActionable = !!item.action;
                        return (
                          <div
                            key={item.id}
                            onClick={() => markAsRead(item.id)}
                            className={cn(
                              "group relative flex gap-3 p-3 rounded-lg border text-xs transition-all cursor-pointer",
                              getPriorityClasses(item.priority),
                              !item.read && "ring-1 ring-violet-500/20 dark:ring-violet-500/30"
                            )}
                          >
                            {/* Category Icon */}
                            <div className="h-8 w-8 rounded-full border border-zinc-200/50 bg-white dark:border-zinc-800 dark:bg-zinc-950 flex items-center justify-center shrink-0 shadow-sm">
                              {getCategoryIcon(item.category)}
                            </div>

                            {/* Text details */}
                            <div className="flex-1 min-w-0 pr-4 space-y-1">
                              <div className="flex justify-between items-baseline gap-2">
                                <h4 className={cn("font-bold text-zinc-900 dark:text-zinc-50 truncate", !item.read && "font-extrabold")}>
                                  {item.title}
                                </h4>
                                <span className="text-[8px] text-zinc-400 dark:text-zinc-500 shrink-0 font-medium flex items-center gap-0.5">
                                  <Clock className="h-2 w-2" />
                                  {formatTimeAgo(item.timestamp)}
                                </span>
                              </div>
                              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                                {item.description}
                              </p>

                              {/* Progress bar */}
                              {item.progress !== undefined && item.progress < 100 && (
                                <div className="space-y-1 pt-1">
                                  <Progress value={item.progress} className="h-1 bg-zinc-100 dark:bg-zinc-800" />
                                  <div className="text-[8px] text-zinc-400 text-right font-mono font-bold">
                                    {item.progress}%
                                  </div>
                                </div>
                              )}

                              {/* Custom Action buttons */}
                              {isActionable && item.action && (
                                <div className="flex gap-2 pt-1">
                                  {item.action.actionType === 'copy' && item.action.copyText ? (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCopyLink(item.action!.copyText!);
                                      }}
                                      className="text-[9px] h-6 px-2.5 font-bold gap-1 cursor-pointer bg-white dark:bg-zinc-950"
                                    >
                                      <Copy className="h-2.5 w-2.5" />
                                      {item.action.label}
                                    </Button>
                                  ) : item.action.href ? (
                                    <Link
                                      href={item.action.href}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        markAsRead(item.id);
                                      }}
                                      passHref
                                    >
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-[9px] h-6 px-2.5 font-bold gap-1 cursor-pointer bg-white dark:bg-zinc-950"
                                      >
                                        <ExternalLink className="h-2.5 w-2.5" />
                                        {item.action.label}
                                      </Button>
                                    </Link>
                                  ) : null}
                                </div>
                              )}
                            </div>

                            {/* Unread circle badge */}
                            {!item.read && (
                              <div className="absolute top-3 right-3 h-1.5 w-1.5 rounded-full bg-violet-500 shadow-sm shrink-0" />
                            )}

                            {/* Dismiss button */}
                            <Button
                              type="button"
                              variant="ghost"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 h-5 w-5 p-0 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                dismissNotification(item.id);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
