import type {
  AppNotification,
  CasinoEvent,
  Jackpot,
  Promotion,
  Reward,
  UserProfile,
} from '@/types/domain';

const now = () => new Date().toISOString();

export const seedJackpots: Jackpot[] = [
  {
    id: 'lion-link',
    name: 'Lion Link',
    game: 'Lion Link Hold & Spin',
    category: 'slots',
    amount: 15863,
    currency: 'USD',
    trend: 'hot',
    imageColor: '#B8323A',
    ticker: 1.85,
    updatedAt: now(),
  },
  {
    id: 'pan-chang',
    name: 'Pan Chang',
    game: 'Pan Chang Fortune',
    category: 'slots',
    amount: 7692,
    currency: 'USD',
    trend: 'rising',
    imageColor: '#A02638',
    ticker: 0.92,
    updatedAt: now(),
  },
  {
    id: 'all-aboard',
    name: 'All Aboard',
    game: 'All Aboard Express',
    category: 'progressive',
    amount: 8062,
    currency: 'USD',
    trend: 'steady',
    imageColor: '#C8861A',
    ticker: 0.45,
    updatedAt: now(),
  },
  {
    id: 'cash-express',
    name: 'Cash Express',
    game: 'Cash Express Luxury Line',
    category: 'progressive',
    amount: 10094,
    currency: 'USD',
    trend: 'rising',
    imageColor: '#1F7A45',
    ticker: 0.71,
    updatedAt: now(),
  },
  {
    id: 'panda-power',
    name: 'Panda Power',
    game: 'Panda Power Megaways',
    category: 'slots',
    amount: 4218,
    currency: 'USD',
    trend: 'new',
    imageColor: '#4D2A82',
    ticker: 0.38,
    updatedAt: now(),
  },
  {
    id: 'royal-baccarat',
    name: 'Royal Baccarat',
    game: 'Mesa de Baccarat VIP',
    category: 'tables',
    amount: 22480,
    currency: 'USD',
    trend: 'hot',
    imageColor: '#1F3A6B',
    ticker: 2.4,
    updatedAt: now(),
  },
  {
    id: 'blackjack-pro',
    name: 'Blackjack Pro',
    game: 'Mesa de Blackjack',
    category: 'tables',
    amount: 6730,
    currency: 'USD',
    trend: 'steady',
    imageColor: '#2D6A4F',
    ticker: 0.22,
    updatedAt: now(),
  },
  {
    id: 'fortune-wheel',
    name: 'Fortune Wheel',
    game: 'Wheel of Fortune Triple',
    category: 'progressive',
    amount: 31920,
    currency: 'USD',
    trend: 'hot',
    imageColor: '#D4A24C',
    ticker: 3.1,
    updatedAt: now(),
  },
];

const inDays = (d: number) => {
  const x = new Date();
  x.setDate(x.getDate() + d);
  return x.toISOString();
};

export const seedPromotions: Promotion[] = [
  {
    id: 'happy-hour',
    title: 'Happy Hour Atlántico',
    subtitle: '2x1 en bebidas y bonos en máquinas',
    description: 'Cada jueves de 6PM a 9PM disfruta el doble en tus juegos favoritos.',
    cta: 'Ver detalles',
    endsAt: inDays(2),
    badge: 'Exclusivo',
    accent: 'gold',
  },
  {
    id: 'noche-vip',
    title: 'Noche VIP',
    subtitle: 'Acceso al salón privado',
    description: 'Música en vivo, mesa premium y degustación de cocina criolla.',
    cta: 'Reservar',
    endsAt: inDays(7),
    badge: 'VIP',
    accent: 'atlantic',
  },
  {
    id: 'free-play',
    title: '$25 en Free Play',
    subtitle: 'Por registrarte hoy',
    description: 'Únete al Club Atlántico y recibe créditos para empezar a jugar.',
    cta: 'Reclamar',
    endsAt: inDays(14),
    badge: 'Bienvenida',
    accent: 'emerald',
  },
];

export const seedEvents: CasinoEvent[] = [
  {
    id: 'torneo-poker',
    title: 'Torneo de Poker Caribe',
    startsAt: inDays(3),
    location: 'Salón Principal',
    capacity: 80,
    attending: 62,
    category: 'tournament',
  },
  {
    id: 'noche-criolla',
    title: 'Noche Criolla en Vivo',
    startsAt: inDays(5),
    location: 'Restaurante Manatí',
    capacity: 120,
    attending: 41,
    category: 'dining',
  },
  {
    id: 'show-sorpresa',
    title: 'Show Sorpresa',
    startsAt: inDays(10),
    location: 'Escenario Atlántico',
    capacity: 250,
    attending: 18,
    category: 'show',
  },
];

export const seedRewards: Reward[] = [
  { id: 'r1', title: 'Cena para 2', description: 'Menú criollo del chef', cost: 1500, category: 'food', imageColor: '#D4A24C' },
  { id: 'r2', title: '$50 Free Play', description: 'Créditos para máquinas', cost: 1000, category: 'play', imageColor: '#3D6FB8' },
  { id: 'r3', title: 'Estadía de Spa', description: 'Día completo para 1', cost: 4500, category: 'experience', imageColor: '#8B5CF6' },
  { id: 'r4', title: 'Polo Casino', description: 'Edición coleccionable', cost: 800, category: 'merch', imageColor: '#1FB07A' },
  { id: 'r5', title: 'Mesa VIP Reservada', description: 'Por 2 horas con bebidas', cost: 3200, category: 'experience', imageColor: '#E5484D' },
  { id: 'r6', title: 'Cocktail Premium', description: 'Bebida de la casa', cost: 350, category: 'food', imageColor: '#F5A524' },
];

export const seedUser: UserProfile = {
  id: 'guest-001',
  displayName: 'Invitado',
  isGuest: true,
  tier: 'classic',
  points: 0,
  pointsToNextTier: 1000,
  streak: 0,
  joinedAt: now(),
};

export const seedNotifications: AppNotification[] = [
  {
    id: 'n1',
    title: 'Lion Link supera los $15K',
    body: 'El jackpot Lion Link sigue subiendo. Ven y prueba tu suerte.',
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    read: false,
    kind: 'jackpot',
  },
  {
    id: 'n2',
    title: 'Happy Hour empieza pronto',
    body: 'Hoy de 6PM a 9PM. 2x1 en bebidas seleccionadas.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    read: false,
    kind: 'promo',
  },
  {
    id: 'n3',
    title: 'Bienvenido al Club Atlántico',
    body: 'Tu cuenta de invitado está activa. Regístrate para acumular puntos.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
    read: true,
    kind: 'system',
  },
];
