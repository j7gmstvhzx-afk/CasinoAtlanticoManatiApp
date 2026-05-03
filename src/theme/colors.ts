export const palette = {
  midnight: '#0B0F19',
  obsidian: '#0F1424',
  ink: '#151A2D',
  graphite: '#1E2540',
  steel: '#2A3354',
  fog: '#7B86A8',
  cloud: '#C7CFE6',
  pearl: '#F5F7FF',

  goldDeep: '#7A5410',
  goldCore: '#D4A24C',
  goldGlow: '#F5C97A',
  goldShine: '#FFE7AF',

  atlanticDeep: '#1F3A6B',
  atlanticCore: '#3D6FB8',
  atlanticGlow: '#6EA0E6',

  emerald: '#1FB07A',
  ruby: '#E5484D',
  amber: '#F5A524',
  violet: '#8B5CF6',
};

export const colors = {
  bg: {
    base: palette.midnight,
    surface: palette.obsidian,
    elevated: palette.ink,
    raised: palette.graphite,
    overlay: 'rgba(11, 15, 25, 0.72)',
  },
  border: {
    subtle: 'rgba(255, 255, 255, 0.06)',
    default: 'rgba(255, 255, 255, 0.10)',
    strong: 'rgba(255, 255, 255, 0.16)',
    gold: 'rgba(245, 201, 122, 0.35)',
  },
  text: {
    primary: palette.pearl,
    secondary: palette.cloud,
    muted: palette.fog,
    inverse: palette.midnight,
    gold: palette.goldGlow,
  },
  brand: {
    gold: palette.goldCore,
    goldGlow: palette.goldGlow,
    gradient: [palette.goldDeep, palette.goldCore, palette.goldShine] as const,
    atlantic: palette.atlanticCore,
    atlanticGradient: [palette.atlanticDeep, palette.atlanticCore, palette.atlanticGlow] as const,
  },
  status: {
    success: palette.emerald,
    danger: palette.ruby,
    warning: palette.amber,
    info: palette.atlanticGlow,
    hot: '#FF5B36',
    rising: palette.amber,
    new: palette.violet,
  },
  shadow: {
    deep: '#000000',
    gold: 'rgba(212, 162, 76, 0.45)',
  },
} as const;

export type ColorTokens = typeof colors;
