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

const RANK_COLORS = [GOLD, '#94a3b8', '#cd7f3f'];
const RANK_ICONS  = ['🥇', '🥈', '🥉'];

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

      {/* Summary KPIs */}
      <View style={tabStyles.kpiGrid}>
        <View style={[tabStyles.kpiCard, { backgroundColor: 'rgba(212,165,116,0.09)' }]}>
          <View style={[styles.topStripe, { backgroundColor: GOLD }]} />
          <Text style={[tabStyles.kpiLabel, { color: '#b8935f' }]}>Total Bancos</Text>
          <Text style={tabStyles.kpiValue}>{banks.length}</Text>
          <Text style={styles.kpiSub}>en el piso</Text>
        </View>
        <View style={[tabStyles.kpiCard, { backgroundColor: 'rgba(42,157,143,0.06)' }]}>
          <View style={[styles.topStripe, { backgroundColor: TEAL }]} />
          <Text style={[tabStyles.kpiLabel, { color: TEAL }]}>Coin-In Total</Text>
          <Text style={[tabStyles.kpiValue, { color: TEAL }]}>{fmt$(totalCoinIn)}</Text>
          <Text style={styles.kpiSub}>período activo</Text>
        </View>
      </View>

      {/* Bank cards */}
      {banks.length === 0 ? (
        <View style={tabStyles.card}>
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>🏦</Text>
            <Text style={styles.empty}>Sin datos para este período</Text>
          </View>
        </View>
      ) : (
        banks.map((bank, i) => {
          const pct        = totalCoinIn > 0 ? (bank.totalCoinIn / totalCoinIn) * 100 : 0;
          const barColor   = i === 0 ? GOLD : i === 1 ? '#94a3b8' : i === 2 ? '#cd7f3f' : TEAL;
          const borderColor = i < 3 ? RANK_COLORS[i] : '#e2e8f0';
          const activeMachines = bank.machines.filter(m => m.active).length;

          return (
            <View key={bank.bank} style={[tabStyles.card, { borderLeftWidth: 4, borderLeftColor: borderColor }]}>
              {/* Top row: rank + bank name + coin-in */}
              <View style={styles.cardTop}>
                <View style={styles.bankLeft}>
                  <Text style={styles.rankIcon}>{RANK_ICONS[i] ?? `#${i + 1}`}</Text>
                  <View>
                    <Text style={styles.bankLabel}>Banco {bank.bank}</Text>
                    <Text style={styles.bankSub}>{activeMachines} activas de {bank.machines.length}</Text>
                  </View>
                </View>
                <View style={styles.cardRight}>
                  <Text style={[styles.coinInText, { color: i === 0 ? '#b8935f' : NAVY }]}>{fmt$(bank.totalCoinIn)}</Text>
                  <View style={[styles.pctBadge, { backgroundColor: i < 3 ? borderColor + '22' : '#f1f5f9' }]}>
                    <Text style={[styles.pctText, { color: i < 3 ? borderColor : '#64748b' }]}>{pct.toFixed(1)}%</Text>
                  </View>
                </View>
              </View>

              {/* Progress bar */}
              <View style={styles.progressTrack}>
                <View style={[styles.progressBar, { width: `${Math.max(pct, 1)}%` as any, backgroundColor: barColor }]} />
              </View>

              {/* Bottom stat: top game */}
              <View style={styles.bottomRow}>
                <Text style={styles.topGameLabel}>Top juego</Text>
                <Text style={styles.topGame} numberOfLines={1}>{bank.topGame || '—'}</Text>
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  topStripe: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 3,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  kpiSub: { fontSize: 10, color: '#94a3b8', marginTop: 2 },

  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  bankLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rankIcon:  { fontSize: 22, lineHeight: 28 },
  bankLabel: { fontSize: 16, fontWeight: '800', color: NAVY, letterSpacing: -0.2 },
  bankSub:   { fontSize: 11, color: '#64748b', marginTop: 1 },
  cardRight: { alignItems: 'flex-end', gap: 4 },
  coinInText:{ fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  pctBadge:  { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  pctText:   { fontSize: 11, fontWeight: '700' },

  progressTrack: {
    height: 10,
    backgroundColor: '#f1f5f9',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressBar: {
    height: '100%',
    borderRadius: 5,
    minWidth: 8,
  },

  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  topGameLabel: { fontSize: 10, fontWeight: '700', color: '#94a3b8', letterSpacing: 0.5 },
  topGame:      { flex: 1, fontSize: 12, fontWeight: '600', color: '#4a5f7f' },

  emptyWrap: { alignItems: 'center', paddingVertical: 32 },
  emptyIcon: { fontSize: 32, marginBottom: 8 },
  empty:     { fontSize: 14, fontWeight: '600', color: '#94a3b8' },
});
