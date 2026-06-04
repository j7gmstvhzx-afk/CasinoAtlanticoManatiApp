import { StyleSheet } from 'react-native';
import type { SlotMachine } from '@/types/domain';

export const NAVY = '#1a2332';
export const GOLD = '#d4a574';
export const TEAL = '#2a9d8f';
export const BORDER = '#e2e8f0';

export type TabProps = {
  onEditMachine: (m: SlotMachine) => void;
};

export const tabStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  content: {
    padding: 16,
    gap: 14,
    paddingBottom: 48,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#1a2332',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: NAVY,
    marginBottom: 14,
    letterSpacing: -0.1,
  },
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 8,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  kpiGrid: {
    flexDirection: 'row' as const,
    gap: 10,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#1a2332',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden' as const,
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#64748b',
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: '#1a2332',
  },
  periodBar: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
  },
  periodChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  periodChipActive: {
    backgroundColor: NAVY,
    borderColor: NAVY,
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  periodChipText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#64748b',
  },
  periodChipTextActive: {
    color: '#ffffff',
  },
});

export function fmt$(n: number): string {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function fmtDeno(d: string): string {
  if (d === '01/02/05/10') return 'Multi';
  return d.replace('0.', '') + '¢';
}

export function bankOf(location: string): string {
  return location.split('-')[0];
}
