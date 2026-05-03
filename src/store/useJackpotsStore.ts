import { create } from 'zustand';
import { jackpotStream } from '@/services/api';
import type { Jackpot, JackpotCategory } from '@/types/domain';

type State = {
  jackpots: Jackpot[];
  filter: JackpotCategory | 'all';
  loading: boolean;
  setFilter: (f: JackpotCategory | 'all') => void;
  init: () => () => void;
};

export const useJackpotsStore = create<State>((set) => ({
  jackpots: [],
  filter: 'all',
  loading: true,
  setFilter(f) {
    set({ filter: f });
  },
  init() {
    set({ loading: true });
    const unsub = jackpotStream.subscribe((items) => {
      set({ jackpots: items, loading: false });
    });
    return unsub;
  },
}));
