import { create } from 'zustand';
import type { Preferences } from '@/types/domain';

type State = Preferences & {
  setPushEnabled: (v: boolean) => void;
  setMarketingEnabled: (v: boolean) => void;
  setHapticsEnabled: (v: boolean) => void;
  setPushToken: (token: string | undefined) => void;
};

export const usePreferencesStore = create<State>((set) => ({
  pushEnabled: true,
  marketingEnabled: true,
  hapticsEnabled: true,
  pushToken: undefined,
  setPushEnabled(v) {
    set({ pushEnabled: v });
  },
  setMarketingEnabled(v) {
    set({ marketingEnabled: v });
  },
  setHapticsEnabled(v) {
    set({ hapticsEnabled: v });
  },
  setPushToken(token) {
    set({ pushToken: token });
  },
}));
