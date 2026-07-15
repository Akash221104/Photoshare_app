// context/NotificationContext.tsx
// Global context for production-grade Notification Center tracking uploads, AI status, and system alerts.

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  category: 'upload' | 'ai' | 'event' | 'warning' | 'error' | 'success' | 'system';
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string; // ISO string
  read: boolean;
  progress?: number; // 0 to 100
  action?: {
    label: string;
    href?: string;
    actionType?: 'link' | 'copy';
    copyText?: string;
  };
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (item: Omit<NotificationItem, 'timestamp' | 'read' | 'id'> & { id?: string }) => string;
  updateNotification: (id: string, updates: Partial<Omit<NotificationItem, 'id'>>) => void;
  dismissNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // 1. Initial load from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('photoshare_notifications');
        if (stored) {
          setNotifications(JSON.parse(stored));
        }
      } catch (err) {
        console.error('Failed to load notifications from localStorage:', err);
      }
    }
  }, []);

  // 2. Sync to localStorage on changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('photoshare_notifications', JSON.stringify(notifications));
      } catch (err) {
        console.error('Failed to save notifications to localStorage:', err);
      }
    }
  }, [notifications]);

  // 3. Network connection listeners
  useEffect(() => {
    const handleOnline = () => {
      addNotification({
        title: 'Connection Restored',
        description: 'Internet connection is back. Resuming background operations.',
        category: 'success',
        priority: 'medium',
      });
      toast.success('Connection restored. Resuming uploads.');
    };

    const handleOffline = () => {
      addNotification({
        title: '⚠ Connection Offline',
        description: 'Internet connection lost. Pausing uploads...',
        category: 'warning',
        priority: 'high',
      });
      toast.warning('Connection lost. Pausing uploads.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addNotification = (item: Omit<NotificationItem, 'timestamp' | 'read' | 'id'> & { id?: string }): string => {
    const id = item.id || `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotif: NotificationItem = {
      ...item,
      id,
      timestamp: new Date().toISOString(),
      read: false,
    };

    setNotifications((prev) => {
      const idx = prev.findIndex((n) => n.id === id);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = newNotif;
        return updated;
      }
      return [newNotif, ...prev];
    });

    return id;
  };

  const updateNotification = (id: string, updates: Partial<Omit<NotificationItem, 'id'>>) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updates } : n))
    );
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        updateNotification,
        dismissNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
}
