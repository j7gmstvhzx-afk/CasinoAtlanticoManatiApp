import { StyleSheet, useWindowDimensions } from 'react-native';

// ── Palette ("Heritage Refined" — lighter, executive slate + muted gold) ─────
export const C = {
  page:      '#f8f9fb',
  card:      '#ffffff',
  navy:      '#3f4d63',
  navy2:     '#556a85',
  navy3:     '#7a8aa3',
  gold:      '#d4a574',
  goldLight: '#e8c9a8',
  goldSoft:  '#f3e6d4',
  track:     '#f0f4fa',
  green:     '#16a34a',
  greenBg:   '#f0fdf4',
  red:       '#dc2626',
  redBg:     '#fef2f2',
  ink:       '#3f4d63',
  text:      '#56657d',
  muted:     '#94a3b8',
  faint:     '#c3ccd9',
  border:    '#e5e9f0',
  rowLine:   '#f4f6f9',
};

// Brand chip blue (logo, login panel, primary actions).
export const CHIP_BLUE      = '#2457b5';
export const CHIP_BLUE_DARK = '#1a3e96';
export const CHIP_BLUE_MID  = '#3568c8';

// Manufacturer colors (donut + accents). Falls back through a palette.
const MFR_COLORS: Record<string, string> = {
  'Konami':         C.navy,
  'Ainsworth':      C.navy2,
  'Light & Wonder': C.goldLight,
  'Aristocrat':     C.navy3,
  'IGT':            C.gold,
  'WMS':            '#9aa6b5',
  'Everi':          '#b08968',
};
const FALLBACK = ['#3f4d63', '#556a85', '#d4a574', '#7a8aa3', '#c8a878', '#9aa6b5', '#b08968', '#7b8794'];

export function mfrColor(name: string, idx = 0): string {
  return MFR_COLORS[name] ?? FALLBACK[idx % FALLBACK.length];
}

export function shortMfr(name: string): string {
  return name.replace('Light & Wonder', 'L&W');
}

// ── Formatters ───────────────────────────────────────────────────────────────
export function money(n: number, decimals = 0): string {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function compactMoney(n: number): string {
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(2) + 'M';
  if (n >= 1_000)     return '$' + (n / 1_000).toFixed(1) + 'K';
  return '$' + Math.round(n).toLocaleString('en-US');
}

export function bankOf(location: string): string {
  return location.split('-')[0];
}

// ── Responsive layout ────────────────────────────────────────────────────────
// Single source of truth for breakpoints so the whole app reflows by screen size.
export const MAX_CONTENT = 1180;

export type Responsive = {
  width: number;
  isPhone: boolean;     // < 640
  isTablet: boolean;    // 640–1024
  isDesktop: boolean;   // ≥ 1024
  gutter: number;       // horizontal page padding
  kpiCols: number;      // KPI cards per row
};

export function useResponsive(): Responsive {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet  = width >= 640 && width < 1024;
  const isPhone   = width < 640;
  return {
    width,
    isPhone,
    isTablet,
    isDesktop,
    gutter:  isDesktop ? 32 : isTablet ? 24 : 16,
    kpiCols: width >= 1024 ? 4 : width >= 560 ? 2 : 1,
  };
}

// ── Tone palette for KPI / icon badges ───────────────────────────────────────
export type Tone = 'navy' | 'gold' | 'green' | 'teal' | 'red';

export const TONES: Record<Tone, { fg: string; bg: string; soft: string }> = {
  navy:  { fg: '#3f4d63', bg: '#f0f2f5', soft: '#f7f8fa' },
  gold:  { fg: '#a87c38', bg: '#faf4e6', soft: '#fcf9f0' },
  green: { fg: '#15803d', bg: '#e8f7ef', soft: '#f3faf6' },
  teal:  { fg: '#3a8a83', bg: '#e8f5f3', soft: '#f2faf8' },
  red:   { fg: '#c65555', bg: '#fce8e8', soft: '#fdf2f2' },
};

// Two-stop gradients per tone, used for icon badges and accent bars.
export const TONE_GRADIENTS: Record<Tone, readonly [string, string]> = {
  navy:  ['#4a5f7f', '#1a2332'],
  gold:  ['#e6c9a8', '#b8935f'],
  green: ['#34d399', '#15803d'],
  teal:  ['#5eead4', '#0f766e'],
  red:   ['#f87171', '#b91c1c'],
};

// ── Shared card styles ───────────────────────────────────────────────────────
export const card = StyleSheet.create({
  base: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#3f4d63',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
  },
  accent: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: C.gold,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: C.ink,
    letterSpacing: -0.2,
  },
});
