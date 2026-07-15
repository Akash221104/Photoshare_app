// hooks/useNotification.ts
// React client hook wrapper for useNotificationContext.

import { useNotificationContext } from '@/context/NotificationContext';

export function useNotification() {
  return useNotificationContext();
}
