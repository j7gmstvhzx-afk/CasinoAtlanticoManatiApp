import { StyleSheet } from 'react-native';

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
