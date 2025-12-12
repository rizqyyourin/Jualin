import { create } from 'zustand';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number; // in milliseconds
  timestamp: number;
}

interface NotificationStore {
  notifications: Notification[];
  addNotification: (
    message: string,
    type: NotificationType,
    duration?: number
  ) => string;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],

  addNotification: (message: string, type: NotificationType, duration = 5000) => {
    const id = `${Date.now()}-${Math.random()}`;
    const notification: Notification = {
      id,
      message,
      type,
      duration,
      timestamp: Date.now(),
    };

    set((state) => ({
      notifications: [...state.notifications, notification],
    }));

    // Auto-remove notification after duration
    if (duration > 0) {
      setTimeout(() => {
        get().removeNotification(id);
      }, duration);
    }

    return id;
  },

  removeNotification: (id: string) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },
}));

// Convenience functions for common notification types
export const useNotifications = () => {
  const store = useNotificationStore();

  return {
    success: (message: string, duration?: number) =>
      store.addNotification(message, 'success', duration),
    error: (message: string, duration?: number) =>
      store.addNotification(message, 'error', duration),
    warning: (message: string, duration?: number) =>
      store.addNotification(message, 'warning', duration),
    info: (message: string, duration?: number) =>
      store.addNotification(message, 'info', duration),
    remove: store.removeNotification,
    clear: store.clearNotifications,
  };
};
