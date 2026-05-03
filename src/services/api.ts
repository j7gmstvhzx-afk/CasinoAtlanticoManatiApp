import {
  seedEvents,
  seedJackpots,
  seedNotifications,
  seedPromotions,
  seedRewards,
  seedUser,
} from './mockData';
import type {
  AppNotification,
  CasinoEvent,
  Jackpot,
  Promotion,
  Reward,
  UserProfile,
} from '@/types/domain';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

/**
 * In production this layer would call NestJS REST endpoints over HTTPS plus a
 * WebSocket channel for jackpot ticks. For the prototype we simulate latency
 * and a real-time stream over setInterval so the UI flows look authentic.
 */
export const api = {
  async getJackpots(): Promise<Jackpot[]> {
    await delay(420);
    return clone(seedJackpots);
  },
  async getPromotions(): Promise<Promotion[]> {
    await delay(360);
    return clone(seedPromotions);
  },
  async getEvents(): Promise<CasinoEvent[]> {
    await delay(320);
    return clone(seedEvents);
  },
  async getRewards(): Promise<Reward[]> {
    await delay(380);
    return clone(seedRewards);
  },
  async getNotifications(): Promise<AppNotification[]> {
    await delay(280);
    return clone(seedNotifications);
  },
  async getUser(): Promise<UserProfile> {
    await delay(220);
    return clone(seedUser);
  },
  async loginGuest(): Promise<UserProfile> {
    await delay(280);
    return { ...seedUser, displayName: 'Invitado', isGuest: true };
  },
  async loginEmail(email: string): Promise<UserProfile> {
    await delay(520);
    return {
      ...seedUser,
      id: 'user-001',
      email,
      displayName: email.split('@')[0] ?? 'Jugador',
      isGuest: false,
      tier: 'silver',
      points: 1240,
      pointsToNextTier: 760,
      streak: 3,
    };
  },
  async loginSocial(provider: 'google' | 'apple' | 'facebook'): Promise<UserProfile> {
    await delay(420);
    return {
      ...seedUser,
      id: `user-${provider}`,
      email: `jugador@${provider}.com`,
      displayName: provider === 'apple' ? 'Jugador Apple' : provider === 'google' ? 'Jugador Google' : 'Jugador FB',
      isGuest: false,
      tier: 'silver',
      points: 980,
      pointsToNextTier: 1020,
      streak: 1,
    };
  },
  async redeemReward(reward: Reward, currentPoints: number): Promise<{ ok: boolean; remaining: number; message: string }> {
    await delay(420);
    if (currentPoints < reward.cost) {
      return { ok: false, remaining: currentPoints, message: 'Puntos insuficientes' };
    }
    return { ok: true, remaining: currentPoints - reward.cost, message: '¡Premio canjeado!' };
  },
  async claimDailySpin(): Promise<{ points: number; label: string }> {
    await delay(360);
    const tiers = [25, 50, 75, 100, 150, 250, 500];
    const points = tiers[Math.floor(Math.random() * tiers.length)];
    return { points, label: `+${points} pts` };
  },
};

type Subscriber = (jackpots: Jackpot[]) => void;

class JackpotStream {
  private current: Jackpot[] = clone(seedJackpots);
  private subscribers = new Set<Subscriber>();
  private interval: ReturnType<typeof setInterval> | null = null;

  subscribe(fn: Subscriber) {
    this.subscribers.add(fn);
    fn(this.current);
    if (!this.interval) this.start();
    return () => {
      this.subscribers.delete(fn);
      if (this.subscribers.size === 0) this.stop();
    };
  }

  private start() {
    this.interval = setInterval(() => this.tick(), 2200);
  }

  private stop() {
    if (this.interval) clearInterval(this.interval);
    this.interval = null;
  }

  private tick() {
    this.current = this.current.map((jp) => {
      const drift = jp.ticker * (0.6 + Math.random() * 1.4);
      const next = jp.amount + drift;
      const trend: Jackpot['trend'] =
        drift > jp.ticker * 1.6
          ? 'hot'
          : drift > jp.ticker
          ? 'rising'
          : jp.trend === 'new'
          ? 'new'
          : 'steady';
      return { ...jp, amount: Math.round(next * 100) / 100, trend, updatedAt: new Date().toISOString() };
    });
    this.subscribers.forEach((fn) => fn(this.current));
  }
}

export const jackpotStream = new JackpotStream();
