export type JackpotCategory = 'progressive' | 'slots' | 'tables';

export type Jackpot = {
  id: string;
  name: string;
  category: JackpotCategory;
  game: string;
  amount: number;
  currency: 'USD';
  imageColor: string;
  isNew?: boolean;
  isFeatured?: boolean;
};

export type JackpotsSnapshot = {
  jackpots: Jackpot[];
  updatedAt: string;
  updatedBy?: string;
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
  category: 'tournament' | 'show' | 'dining' | 'special';
  description?: string;
};

export type MenuCategory = 'entradas' | 'criollo' | 'parrilla' | 'mariscos' | 'bebidas' | 'postres';

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  spicy?: boolean;
  popular?: boolean;
  vegetarian?: boolean;
};

export type GameTable = {
  id: string;
  name: string;
  description: string;
  minBet?: number;
};

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  kind: 'jackpot' | 'promo' | 'event' | 'system';
};

export type Preferences = {
  pushEnabled: boolean;
  marketingEnabled: boolean;
  hapticsEnabled: boolean;
  pushToken?: string;
};
