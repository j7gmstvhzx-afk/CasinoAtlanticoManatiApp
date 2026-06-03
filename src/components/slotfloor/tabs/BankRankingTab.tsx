import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui';
import { useSlotFloorStore } from '@/store/useSlotFloorStore';
import type { CoinInPeriod } from '@/types/domain';
import { tabStyles, NAVY, GOLD, TEAL, fmt$, type TabProps } from './shared';

const PERIODS: { key: CoinInPeriod; label: string }[] = [
  { key: 'ytd',        label: 'YTD' },
  { key: 'semiannual', label: '6 Meses' },
  { key: 'quarterly',  label: 'Trimestral' },
  { key: 'mtd',        label: 'MTD' },
  { key: 'annual',     label: 'Anual' },
];

const MEDAL = ['🥇', '🥈', '🥉'];

export function BankRankingTab({ onEditMachine }: TabProps) {
  const [period, setPeriod] = useState<CoinInPeriod>('ytd');
  const getBankGroups = useSlotFloorStore(s => s.getBankGroups);
  const banks = getBankGroups(period);
  const totalCoinIn = banks.reduce((s, b) => s + b.totalCoinIn, 0);

  return (
    <ScrollView style={tabStyles.container} contentContainerStyle={tabStyles.content}>
      {/* Period selector */}
      <View style={tabStyles.periodBar}>
        {PERIODS.map(p => (
          <Pressable
            key={p.key}
            style={[tabStyles.periodChip, period === p.key && tabStyles.periodChipActive]}
            onPress={() => setPeriod(p.key)}
          >
            <Text style={[tabStyles.periodChipText, period === p.key && tabStyles.periodChipTextActive]}>
              {p.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Summary */}
      <View style={tabStyles.kpiGrid}>
        <View style={[tabStyles.kpiCard, { borderLeftWidth: 3, borderLeftColor: GOLD }]}>
          <Text style={tabStyles.kpiLabel}>Total Bancos</Text>
          <Text style={tabStyles.kpiValue}>{banks.length}</Text>
        </View>
        <View style={[tabStyles.kpiCard, { borderLeftWidth: 3, borderLeftColor: TEAL }]}>
          <Text style={tabStyles.kpiLabel}>Coin-In Total</Text>
          <Text style={[tabStyles.kpiValue, { color: TEAL, fontSize: 16 }]}>{fmt$(totalCoinIn)}</Text>
        </View>
      </View>

      {/* Bank cards */}
      {banks.map((bank, i) => {
        const pct = totalCoinIn > 0 ? (bank.totalCoinIn / totalCoinIn) * 100 : 0;
        return (
          <View key={bank.bank} style={[tabStyles.card, i === 0 && styles.topCard]}>
            <View style={styles.cardTop}>
              <View style={styles.bankBadge}>
                <Text style={styles.bankBadgeText}>
                  {MEDAL[i] ?? `#${i + 1}`}
                </Text>
                <Text style={styles.bankLabel}>Banco {bank.bank}</Text>
              </View>
              <View style={styles.cardRight}>
                <Text style={styles.coinInText}>{fmt$(bank.totalCoinIn)}</Text>
                <Text style={styles.pctText}>{pct.toFixed(1)}% del total</Text>
              </View>
            </View>

            {/* Progress bar */}
            <View style={styles.progressTrack}>
              <View style={[styles.progressBar, { width: `${pct}%` as any, backgroundColor: i < 3 ? GOLD : TEAL }]} />
            </View>

            {/* Stats row */}
            <View style={styles.statsRow}>
              <Text style={styles.statItem}>
                <Text style={styles.statValue}>{bank.machines.length}</Text>
                <Text style={styles.statLabel}> máqs.</Text>
              </Text>
              <Text style={styles.statItem} numberOfLines={1}>
                <Text style={styles.statLabel}>Top: </Text>
                <Text style={styles.statValue}>{bank.topGame}</Text>
              </Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  topCard: {
    borderLeftWidth: 4,
    borderLeftColor: GOLD,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bankBadgeText: {
    fontSize: 20,
    lineHeight: 24,
  },
  bankLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: NAVY,
  },
  cardRight:   { alignItems: 'flex-end' },
  coinInText:  { fontSize: 18, fontWeight: '800', color: NAVY },
  pctText:     { fontSize: 11, color: '#64748b', marginTop: 2 },
  progressTrack: {
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
    minWidth: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem:  { fontSize: 12, color: '#64748b' },
  statValue: { fontWeight: '600', color: NAVY },
  statLabel: { color: '#94a3b8' },
});
