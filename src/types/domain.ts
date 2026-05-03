export type JackpotCategory = 'progressive' | 'slots' | 'tables';
export type JackpotTrend = 'hot' | 'rising' | 'new' | 'steady';

export type Jackpot = {
  id: string;
  name: string;
  category: JackpotCategory;
  amount: number;
  currency: 'USD';
  trend: JackpotTrend;
  game: string;
  imageColor: string;
  ticker: number;
  updatedAt: string;
};

export type Promotion = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  cta: string;
  endsAt: string;
  badge?: string;
  accent: 'gold' | 'atlantic' | 'ruby' | 'emerald';
};

export type CasinoEvent = {
  id: string;
  title: string;
  startsAt: string;
  location: string;
  capacity: number;
  attending: number;
  category: 'tournament' | 'show' | 'dining' | 'special';
};

export type LoyaltyTier = 'classic' | 'silver' | 'gold' | 'platinum' | 'diamond';

export type Reward = {
  id: string;
  title: string;
  description: string;
  cost: number;
  category: 'food' | 'play' | 'experience' | 'merch';
  imageColor: string;
};

export type UserProfile = {
  id: string;
  displayName: string;
  email?: string;
  isGuest: boolean;
  tier: LoyaltyTier;
  points: number;
  pointsToNextTier: number;
  streak: number;
  lastSpinAt?: string;
  joinedAt: string;
};

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  kind: 'jackpot' | 'promo' | 'event' | 'loyalty' | 'system';
};
