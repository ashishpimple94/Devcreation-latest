import { create } from 'zustand';
import { api } from '@/lib/api';
import type { AppNotification } from '@/types';

interface NotificationState {
  items: AppNotification[];
  unread: number;
  loading: boolean;
  refresh: () => Promise<void>;
  prepend: (n: AppNotification) => void;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  reset: () => void;
}

/** Notification store shared by the storefront bell and the admin center. */
export const useNotificationStore = create<NotificationState>((set, get) => ({
  items: [],
  unread: 0,
  loading: false,

  async refresh() {
    set({ loading: true });
    try {
      const res = await api.get<{ items: AppNotification[]; unread: number }>('/notifications?limit=20');
      set({ items: res.data.items, unread: res.data.unread });
    } finally {
      set({ loading: false });
    }
  },

  // Called when a real-time event arrives over the socket.
  prepend(n) {
    set((s) => ({ items: [n, ...s.items].slice(0, 40), unread: s.unread + 1 }));
  },

  async markRead(id) {
    await api.post(`/notifications/${id}/read`);
    set((s) => ({
      items: s.items.map((i) => (i._id === id ? { ...i, isRead: true } : i)),
      unread: Math.max(s.unread - 1, 0),
    }));
  },

  async markAllRead() {
    await api.post('/notifications/read-all');
    set((s) => ({ items: s.items.map((i) => ({ ...i, isRead: true })), unread: 0 }));
  },

  reset: () => set({ items: [], unread: 0 }),
}));
