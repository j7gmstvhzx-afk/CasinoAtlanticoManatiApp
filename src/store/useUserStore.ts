import { create } from 'zustand';
import { api } from '@/services/api';
import { seedUser } from '@/services/mockData';
import type { LoyaltyTier, UserProfile } from '@/types/domain';

const tierThresholds: Record<LoyaltyTier, number> = {
  classic: 0,
  silver: 1000,
  gold: 5000,
  platinum: 15000,
  diamond: 35000,
};

const tierOrder: LoyaltyTier[] = ['classic', 'silver', 'gold', 'platinum', 'diamond'];

const computeTier = (points: number): { tier: LoyaltyTier; toNext: number } => {
  let tier: LoyaltyTier = 'classic';
  for (const t of tierOrder) {
    if (points >= tierThresholds[t]) tier = t;
  }
  const idx = tierOrder.indexOf(tier);
  const next = tierOrder[idx + 1];
  const toNext = next ? tierThresholds[next] - points : 0;
  return { tier, toNext };
};

type State = {
  user: UserProfile;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  loginGuest: () => Promise<void>;
  loginEmail: (email: string) => Promise<void>;
  loginSocial: (provider: 'google' | 'apple' | 'facebook') => Promise<void>;
  logout: () => void;
  addPoints: (n: number) => void;
  spendPoints: (n: number) => void;
  bumpStreak: () => void;
  markSpinClaimed: () => void;
};

export const useUserStore = create<State>((set, get) => ({
  user: seedUser,
  hydrated: false,
  async hydrate() {
    const u = await api.getUser();
    set({ user: u, hydrated: true });
  },
  async loginGuest() {
    const u = await api.loginGuest();
    set({ user: u });
  },
  async loginEmail(email) {
    const u = await api.loginEmail(email);
    set({ user: u });
  },
  async loginSocial(provider) {
    const u = await api.loginSocial(provider);
    set({ user: u });
  },
  logout() {
    set({ user: { ...seedUser } });
  },
  addPoints(n) {
    const { user } = get();
    const points = user.points + n;
    const { tier, toNext } = computeTier(points);
    set({ user: { ...user, points, tier, pointsToNextTier: toNext } });
  },
  spendPoints(n) {
    const { user } = get();
    const points = Math.max(0, user.points - n);
    const { tier, toNext } = computeTier(points);
    set({ user: { ...user, points, tier, pointsToNextTier: toNext } });
  },
  bumpStreak() {
    const { user } = get();
    set({ user: { ...user, streak: user.streak + 1 } });
  },
  markSpinClaimed() {
    const { user } = get();
    set({ user: { ...user, lastSpinAt: new Date().toISOString() } });
  },
}));
