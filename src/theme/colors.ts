// Light navy/gold palette — matches DASHBOARD_CASINO_SPEC.md
export const palette = {
  // Page backgrounds
  snow:   '#f8f9fa',
  white:  '#ffffff',
  mist:   '#f1f5f9',
  ash:    '#e2e8f0',
  silver: '#cbd5e1',
  slate:  '#94a3b8',
  gray:   '#64748b',

  // Navy brand
  navyDark:   '#1a2332',
  navyMedium: '#2d3e50',
  navyLight:  '#4a5f7f',

  // Gold accent
  goldDark:  '#b8935f',
  goldCore:  '#d4a574',
  goldLight: '#e6c9a8',
  goldShine: '#f5e6d3',

  // Data / status accents (kept from original for charts)
  teal:         '#2a9d8f',
  emerald:      '#16a34a',
  ruby:         '#dc2626',
  amber:        '#f59e0b',
  violet:       '#8b5cf6',
  atlanticCore: '#3D6FB8',

  // Chip blue (login screen accents)
  chipBlue:     '#2457b5',
  chipBlueDark: '#1a3e96',
  chipBlueMid:  '#3568c8',
};

export const colors = {
  bg: {
    base:    palette.snow,
    surface: palette.white,
    elevated: palette.white,
    raised:  palette.mist,
    overlay: 'rgba(0, 0, 0, 0.50)',
  },
  border: {
    subtle:  'rgba(0, 0, 0, 0.06)',
    default: '#e2e8f0',
    strong:  '#cbd5e1',
    gold:    'rgba(212, 165, 116, 0.35)',
  },
  text: {
    primary:   palette.navyDark,
    secondary: palette.gray,
    muted:     palette.slate,
    inverse:   '#ffffff',
    gold:      palette.goldDark,
  },
  brand: {
    gold:              palette.goldCore,
    goldGlow:          palette.goldLight,
    gradient: [palette.goldDark, palette.goldCore, palette.goldLight] as const,
    atlantic:          palette.atlanticCore,
    atlanticGradient:  ['#1F3A6B', '#3D6FB8', '#6EA0E6'] as const,
  },
  status: {
    success: palette.emerald,
    danger:  palette.ruby,
    warning: palette.amber,
    info:    palette.atlanticCore,
    hot:     '#FF5B36',
    rising:  palette.amber,
    new:     palette.violet,
  },
  shadow: {
    deep: '#000000',
    gold: 'rgba(212, 165, 116, 0.25)',
  },
} as const;

export type ColorTokens = typeof colors;
