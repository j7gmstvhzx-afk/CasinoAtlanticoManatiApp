import { StyleSheet, useWindowDimensions } from 'react-native';

// ── Palette (matches Slot Floor Analytics reference) ─────────────────────────
export const C = {
  page:      '#f4f6f9',
  card:      '#ffffff',
  navy:      '#1a2332',
  navy2:     '#2d3e50',
  navy3:     '#4a5f7f',
  gold:      '#c89b63',
  goldLight: '#d4a574',
  goldSoft:  '#e8d4b8',
  track:     '#eef1f5',
  green:     '#1f9d57',
  greenBg:   '#e6f5ec',
  red:       '#d64545',
  redBg:     '#fbe9e9',
  ink:       '#1a2332',
  text:      '#3b4859',
  muted:     '#8a95a5',
  faint:     '#aeb7c4',
  border:    '#e8ecf1',
  rowLine:   '#f1f4f7',
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
const FALLBACK = ['#1a2332', '#2d3e50', '#d4a574', '#4a5f7f', '#c89b63', '#9aa6b5', '#b08968', '#7b8794'];

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
  navy:  { fg: '#1a2332', bg: '#eaeef4', soft: '#f3f6fa' },
  gold:  { fg: '#b8863f', bg: '#f7edda', soft: '#fbf5e9' },
  green: { fg: '#1f9d57', bg: '#e3f4ea', soft: '#f0faf3' },
  teal:  { fg: '#2d6a6a', bg: '#e0f0f0', soft: '#eef7f7' },
  red:   { fg: '#d64545', bg: '#fbe6e6', soft: '#fdf1f1' },
};

// ── Shared card styles ───────────────────────────────────────────────────────
export const card = StyleSheet.create({
  base: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#1a2332',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 2,
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
