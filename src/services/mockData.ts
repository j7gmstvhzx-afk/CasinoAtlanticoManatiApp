import type {
  AppNotification,
  CasinoEvent,
  GameTable,
  JackpotsSnapshot,
  MenuItem,
  Promotion,
} from '@/types/domain';

const inDays = (d: number) => {
  const x = new Date();
  x.setDate(x.getDate() + d);
  return x.toISOString();
};

const todayAt = (h: number, m: number) => {
  const x = new Date();
  x.setHours(h, m, 0, 0);
  return x.toISOString();
};

/**
 * Snapshot de jackpots subido por el administrador del casino.
 * En producción este endpoint devuelve la última versión publicada por el admin.
 */
export const seedJackpotsSnapshot: JackpotsSnapshot = {
  updatedAt: todayAt(8, 12),
  updatedBy: 'Administración',
  jackpots: [
    { id: 'lion-link', name: 'Lion Link', game: 'Lion Link Hold & Spin', category: 'slots', amount: 15863, currency: 'USD', imageColor: '#B8323A', isFeatured: true },
    { id: 'pan-chang', name: 'Pan Chang', game: 'Pan Chang Fortune', category: 'slots', amount: 7692, currency: 'USD', imageColor: '#A02638' },
    { id: 'all-aboard', name: 'All Aboard', game: 'All Aboard Express', category: 'progressive', amount: 8062, currency: 'USD', imageColor: '#C8861A' },
    { id: 'cash-express', name: 'Cash Express', game: 'Cash Express Luxury Line', category: 'progressive', amount: 10094, currency: 'USD', imageColor: '#1F7A45' },
    { id: 'panda-power', name: 'Panda Power', game: 'Panda Power Megaways', category: 'slots', amount: 4218, currency: 'USD', imageColor: '#4D2A82', isNew: true },
    { id: 'fortune-wheel', name: 'Fortune Wheel', game: 'Wheel of Fortune Triple', category: 'progressive', amount: 31920, currency: 'USD', imageColor: '#D4A24C' },
    { id: 'royal-baccarat', name: 'Royal Baccarat', game: 'Mesa de Baccarat VIP', category: 'tables', amount: 22480, currency: 'USD', imageColor: '#1F3A6B' },
    { id: 'blackjack-pro', name: 'Blackjack Pro', game: 'Mesa de Blackjack', category: 'tables', amount: 6730, currency: 'USD', imageColor: '#2D6A4F' },
  ],
};

export const seedPromotions: Promotion[] = [
  {
    id: 'happy-hour',
    title: 'Happy Hour Atlántico',
    subtitle: '2x1 en bebidas seleccionadas',
    description: 'Cada jueves de 6PM a 9PM disfruta el doble en tus bebidas favoritas en el bar principal.',
    cta: 'Ver detalles',
    endsAt: inDays(2),
    badge: 'Exclusivo',
    accent: 'gold',
  },
  {
    id: 'noche-vip',
    title: 'Noche VIP',
    subtitle: 'Acceso al salón privado',
    description: 'Música en vivo, mesa premium y degustación de cocina criolla. Reserva con 24 horas de anticipación.',
    cta: 'Reservar',
    endsAt: inDays(7),
    badge: 'VIP',
    accent: 'atlantic',
  },
  {
    id: 'cumpleanos',
    title: 'Cumpleaños Atlántico',
    subtitle: 'Cena gratis el día de tu cumpleaños',
    description: 'Muestra tu identificación en el restaurante el día de tu cumpleaños y recibe la cena de cortesía.',
    cta: 'Conocer más',
    endsAt: inDays(30),
    badge: 'Beneficio',
    accent: 'emerald',
  },
];

export const seedEvents: CasinoEvent[] = [
  {
    id: 'torneo-poker',
    title: 'Torneo de Poker Caribe',
    startsAt: inDays(3),
    location: 'Salón Principal',
    category: 'tournament',
    description: 'Torneo abierto a todos los niveles. Inscripción gratuita.',
  },
  {
    id: 'noche-criolla',
    title: 'Noche Criolla en Vivo',
    startsAt: inDays(5),
    location: 'Restaurante Manatí',
    category: 'dining',
    description: 'Cena criolla con música en vivo a partir de las 7PM.',
  },
  {
    id: 'show-sorpresa',
    title: 'Show Sorpresa',
    startsAt: inDays(10),
    location: 'Escenario Atlántico',
    category: 'show',
    description: 'Espectáculo especial para nuestros visitantes.',
  },
];

export const seedMenu: MenuItem[] = [
  { id: 'm1', name: 'Bacalaítos', description: 'Frituras de bacalao crujientes con salsa criolla.', price: 7, category: 'entradas', popular: true },
  { id: 'm2', name: 'Sorullitos de Maíz', description: 'Con queso y mayoketchup de la casa.', price: 6, category: 'entradas', vegetarian: true },
  { id: 'm3', name: 'Empanadillas de Carne', description: 'Rellenas de picadillo criollo.', price: 8, category: 'entradas' },

  { id: 'm4', name: 'Mofongo de Pollo', description: 'Plátano majado con ajo y chicharrón, pollo guisado encima.', price: 18, category: 'criollo', popular: true },
  { id: 'm5', name: 'Pernil Asado', description: 'Pernil al horno con arroz con gandules y tostones.', price: 19, category: 'criollo' },
  { id: 'm6', name: 'Arroz con Habichuelas', description: 'Arroz blanco con habichuelas guisadas, plato del día.', price: 12, category: 'criollo', vegetarian: true },
  { id: 'm7', name: 'Pasteles', description: 'Pasteles de yuca rellenos de cerdo, con arroz.', price: 14, category: 'criollo' },

  { id: 'm8', name: 'Churrasco a la Parrilla', description: 'Con chimichurri, papa asada y vegetales.', price: 28, category: 'parrilla', popular: true },
  { id: 'm9', name: 'Pollo a la Parrilla', description: 'Con arroz, habichuelas y maduros.', price: 17, category: 'parrilla' },
  { id: 'm10', name: 'Costillas Glaseadas', description: 'Costillas en salsa BBQ casera.', price: 22, category: 'parrilla', spicy: true },

  { id: 'm11', name: 'Mofongo Relleno de Camarones', description: 'En salsa criolla, con vegetales.', price: 24, category: 'mariscos', popular: true },
  { id: 'm12', name: 'Filete de Chillo Frito', description: 'Pescado entero con tostones y ensalada.', price: 26, category: 'mariscos' },
  { id: 'm13', name: 'Asopao de Mariscos', description: 'Sopa espesa con camarones, pulpo y pescado.', price: 21, category: 'mariscos' },

  { id: 'm14', name: 'Piña Colada', description: 'Coco, piña y ron blanco. Receta original.', price: 11, category: 'bebidas', popular: true },
  { id: 'm15', name: 'Medalla Light', description: 'Cerveza puertorriqueña fría.', price: 5, category: 'bebidas' },
  { id: 'm16', name: 'Ron Don Q Cristal', description: 'Trago doble con limón.', price: 9, category: 'bebidas' },
  { id: 'm17', name: 'Café Criollo', description: 'Café espresso de la isla.', price: 4, category: 'bebidas', vegetarian: true },

  { id: 'm18', name: 'Tres Leches', description: 'Bizcocho clásico con tres leches y canela.', price: 8, category: 'postres', popular: true },
  { id: 'm19', name: 'Flan de Coco', description: 'Flan casero con caramelo de coco.', price: 7, category: 'postres', vegetarian: true },
  { id: 'm20', name: 'Tembleque', description: 'Postre tradicional de coco con canela.', price: 6, category: 'postres', vegetarian: true },
];

export const seedTables: GameTable[] = [
  { id: 't1', name: 'Blackjack', description: 'Mesas clásicas con dealer en vivo.', minBet: 10 },
  { id: 't2', name: 'Baccarat', description: 'Salón VIP, ambiente exclusivo.', minBet: 25 },
  { id: 't3', name: 'Ruleta Americana', description: 'Ruleta de doble cero.', minBet: 5 },
  { id: 't4', name: 'Three Card Poker', description: 'Variante rápida de poker.', minBet: 10 },
];

export const seedNotifications: AppNotification[] = [
  {
    id: 'n1',
    title: 'Jackpots actualizados',
    body: 'Los premios del día ya están publicados. Lion Link supera los $15K.',
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
    title: 'Bienvenido a Casino Atlántico',
    body: 'Activa las notificaciones para recibir promociones y actualizaciones.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
    read: true,
    kind: 'system',
  },
];
