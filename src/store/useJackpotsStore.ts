import { create } from 'zustand';
import { api } from '@/services/api';
import type { Jackpot, JackpotCategory, JackpotsSnapshot } from '@/types/domain';

type State = {
  snapshot?: JackpotsSnapshot;
  filter: JackpotCategory | 'all';
  loading: boolean;
  error?: string;
  setFilter: (f: JackpotCategory | 'all') => void;
  load: () => Promise<void>;
  refresh: () => Promise<void>;
};

export const useJackpotsStore = create<State>((set, get) => ({
  snapshot: undefined,
  filter: 'all',
  loading: true,
  setFilter(f) {
    set({ filter: f });
  },
  async load() {
    if (get().snapshot) return;
    set({ loading: true });
    try {
      const snapshot = await api.getJackpots();
      set({ snapshot, loading: false });
    } catch (err) {
      set({ error: 'No pudimos cargar los premios', loading: false });
    }
  },
  async refresh() {
    set({ loading: true });
    try {
      const snapshot = await api.getJackpots();
      set({ snapshot, loading: false });
    } catch (err) {
      set({ error: 'No pudimos refrescar los premios', loading: false });
    }
  },
}));

export const filterJackpots = (
  jackpots: Jackpot[],
  filter: JackpotCategory | 'all',
): Jackpot[] => (filter === 'all' ? jackpots : jackpots.filter((j) => j.category === filter));
