import { create } from 'zustand';
import { api } from '@/services/api';
import type { AppNotification } from '@/types/domain';

type State = {
  items: AppNotification[];
  unread: number;
  hydrate: () => Promise<void>;
  markAllRead: () => void;
  push: (n: AppNotification) => void;
};

export const useNotificationsStore = create<State>((set, get) => ({
  items: [],
  unread: 0,
  async hydrate() {
    const items = await api.getNotifications();
    set({ items, unread: items.filter((i) => !i.read).length });
  },
  markAllRead() {
    set({ items: get().items.map((i) => ({ ...i, read: true })), unread: 0 });
  },
  push(n) {
    const items = [n, ...get().items];
    set({ items, unread: items.filter((i) => !i.read).length });
  },
}));
