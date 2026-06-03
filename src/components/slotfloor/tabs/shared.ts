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
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 48,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#94a3b8',
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
    marginBottom: 12,
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
    gap: 12,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    alignItems: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: '#94a3b8',
    letterSpacing: 0.6,
    textTransform: 'uppercase' as const,
    textAlign: 'center' as const,
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1a2332',
    textAlign: 'center' as const,
  },
  periodBar: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
    marginBottom: 16,
  },
  periodChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  periodChipActive: {
    backgroundColor: '#1a2332',
    borderColor: '#1a2332',
  },
  periodChipText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: '#64748b',
  },
  periodChipTextActive: {
    color: '#ffffff',
    fontWeight: '600' as const,
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
