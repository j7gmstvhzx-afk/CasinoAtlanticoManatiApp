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

// ── Slot Floor Analytics ──────────────────────────────────────────────────────

export type SlotManufacturer =
  | 'Light & Wonder'
  | 'Aristocrat'
  | 'IGT'
  | 'Konami'
  | 'Everi'
  | 'Ainsworth'
  | 'WMS';

export type SlotMachineType = 'Easy Bet' | 'Multi Line';

export type SlotMachine = {
  id: string;
  location: string;
  game: string;
  manufacturer: SlotManufacturer;
  type: SlotMachineType;
  minBet: number;
  multiDeno: boolean;
  denomination: string;
  maxBet01: number | null;
  maxBet02: number | null;
  maxBet05: number | null;
  maxBet10: number | null;
  active: boolean;
  period?: string | null;
  periodStart?: string | null;
  periodEnd?: string | null;
  avgCoinIn?: number;
  avgWin?: number;
};

export type CoinInEntry = {
  machineId: string;
  date: string;
  amount: number;
};

export type FloorStats = {
  total: number;
  active: number;
  easyBet: number;
  multiLine: number;
  multiDeno: number;
  singleDeno: number;
  byManufacturer: Array<{ name: string; count: number }>;
  byDenomination: Array<{ label: string; count: number }>;
  avgCoinIn: number;
  avgWin: number;
  winPct: number;
  minBetStats: {
    min: number;
    max: number;
    avg: number;
    accessibleCount: number;
    highCount: number;
    accessibleAvg: number;
    highAvg: number;
  };
  maxBet01Stats: {
    min: number;
    max: number;
    avg: number;
    distribution: Array<{ value: string; count: number }>;
  };
  maxBet05Stats: {
    min: number;
    max: number;
    avg: number;
    distribution: Array<{ value: string; count: number }>;
  };
};

export type MachineChange = {
  id?: number;
  mc: string;
  type: 'compra' | 'reubicacion' | 'cambio_juego' | 'removida';
  manufacturer: string;
  game2024?: string;
  game2025?: string;
  location2024?: string;
  location2025?: string;
  bank: number;
  recordedAt?: string;
  periodLabel?: string;
};

export type ExplorerFilters = {
  manufacturer: SlotManufacturer | null;
  type: SlotMachineType | null;
  denomination: string | null;
};
