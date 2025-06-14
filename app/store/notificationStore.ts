import { create } from 'zustand';
import { GameNotification } from '../types/notifications';

interface NotificationState {
  notifications: GameNotification[];
  unreadCount: number;

  // Actions
  addNotification: (notification: GameNotification) => void;
  markAsRead: (notificationId?: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),

  markAsRead: (notificationId) =>
    set((state) => {
      if (notificationId) {
        // Mark specific notification as read (if we track read status)
        return state;
      } else {
        // Mark latest notification as read
        return {
          ...state,
          unreadCount: Math.max(0, state.unreadCount - 1),
        };
      }
    }),

  markAllAsRead: () =>
    set((state) => ({
      ...state,
      unreadCount: 0,
    })),

  removeNotification: (notificationId) =>
    set((state) => ({
      notifications: state.notifications.filter(
        (_, index) => index.toString() !== notificationId
      ),
    })),

  clearAllNotifications: () =>
    set({
      notifications: [],
      unreadCount: 0,
    }),
}));
