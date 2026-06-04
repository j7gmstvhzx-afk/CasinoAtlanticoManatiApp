import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui';
import { useSlotFloorStore } from '@/store/useSlotFloorStore';
import type { CoinInPeriod } from '@/types/domain';
import { tabStyles, NAVY, GOLD, TEAL, fmt$, bankOf, type TabProps } from './shared';

const PERIODS: { key: CoinInPeriod; label: string }[] = [
  { key: 'ytd',        label: 'YTD' },
  { key: 'semiannual', label: '6 Meses' },
  { key: 'quarterly',  label: 'Trimestral' },
  { key: 'mtd',        label: 'MTD' },
  { key: 'annual',     label: 'Anual' },
];

const RANK_COLORS = [GOLD, '#a8b2c0', '#cd7f3f'];
const RANK_LABELS = ['1°', '2°', '3°'];

export function TopMachinesTab({ onEditMachine }: TabProps) {
  const [period, setPeriod] = useState<CoinInPeriod>('ytd');
  const getTop = useSlotFloorStore(s => s.getTopMachinesByCoinIn);
  const top20  = getTop(period, 20);
  const total  = top20.reduce((s, r) => s + r.total, 0);
  const avg    = top20.length ? total / top20.length : 0;

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
        <View style={[tabStyles.kpiCard, styles.kpiTeal]}>
          <View style={[styles.kpiStripe, { backgroundColor: TEAL }]} />
          <Text style={[tabStyles.kpiLabel, { color: TEAL }]}>Total Coin-In</Text>
          <Text style={[tabStyles.kpiValue, { color: NAVY }]}>{fmt$(total)}</Text>
          <Text style={styles.kpiSub}>Top 20 máqs.</Text>
        </View>
        <View style={[tabStyles.kpiCard, styles.kpiGold]}>
          <View style={[styles.kpiStripe, { backgroundColor: GOLD }]} />
          <Text style={[tabStyles.kpiLabel, { color: '#b8935f' }]}>Promedio Top 20</Text>
          <Text style={[tabStyles.kpiValue, { color: NAVY }]}>{fmt$(avg)}</Text>
          <Text style={styles.kpiSub}>por máquina</Text>
        </View>
      </View>

      {/* Table card */}
      <View style={tabStyles.card}>
        {/* Section header */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionDot} />
          <Text style={tabStyles.cardTitle}>Ranking · Top 20 Máquinas</Text>
        </View>

        {/* Table header row */}
        <View style={[styles.tableRow, styles.tableHeaderRow]}>
          <Text style={[styles.colRank, styles.headerText]}>#</Text>
          <Text style={[styles.colMc,   styles.headerText]}>MC</Text>
          <Text style={[styles.colGame, styles.headerText]}>Juego</Text>
          <Text style={[styles.colMfr,  styles.headerText]}>Fab.</Text>
          <Text style={[styles.colBank, styles.headerText]}>Banco</Text>
          <Text style={[styles.colCoin, styles.headerText]}>Coin-In</Text>
        </View>

        {top20.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.empty}>Sin datos para este período</Text>
            <Text style={styles.emptyHint}>Verifica la conexión con la base de datos</Text>
          </View>
        ) : (
          top20.map(({ machine: m, total: coinIn }, i) => {
            const isTop3 = i < 3;
            const rowBg = isTop3
              ? i === 0 ? 'rgba(212,165,116,0.08)' : 'rgba(212,165,116,0.04)'
              : i % 2 === 0 ? '#ffffff' : '#f8fafc';
            return (
              <Pressable
                key={m.id}
                style={({ pressed }) => [
                  styles.tableRow,
                  i === top20.length - 1 && tabStyles.rowLast,
                  { backgroundColor: pressed ? '#f0f4f8' : rowBg },
                ]}
                onPress={() => onEditMachine(m)}
              >
                {isTop3 ? (
                  <View style={[styles.rankBadge, { backgroundColor: RANK_COLORS[i] }]}>
                    <Text style={styles.rankBadgeText}>{RANK_LABELS[i]}</Text>
                  </View>
                ) : (
                  <Text style={[styles.colRank, styles.rankNum]}>{i + 1}</Text>
                )}
                <Text style={[styles.colMc, styles.mcText]}>{m.id}</Text>
                <Text style={[styles.colGame, styles.gameText]} numberOfLines={1}>{m.game}</Text>
                <Text style={[styles.colMfr, styles.mfrText]} numberOfLines={1}>
                  {m.manufacturer.replace('Light & Wonder', 'L&W')}
                </Text>
                <Text style={[styles.colBank, styles.bankText]}>{bankOf(m.location)}</Text>
                <Text style={[styles.colCoin, coinIn > 0 ? styles.coinIn : styles.coinZero]}>
                  {fmt$(coinIn)}
                </Text>
              </Pressable>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // KPI card variants
  kpiTeal: {
    backgroundColor: 'rgba(42,157,143,0.06)',
    overflow: 'hidden',
  },
  kpiGold: {
    backgroundColor: 'rgba(212,165,116,0.09)',
    overflow: 'hidden',
  },
  kpiStripe: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 3,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  kpiSub: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionDot: {
    width: 4,
    height: 16,
    borderRadius: 2,
    backgroundColor: TEAL,
  },

  // Table
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 4,
    borderRadius: 6,
    paddingHorizontal: 4,
  },
  tableHeaderRow: {
    borderBottomWidth: 2,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 8,
    marginBottom: 4,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  headerText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  colRank:  { width: 32, textAlign: 'center', alignItems: 'center' },
  colMc:    { width: 52 },
  colGame:  { flex: 1 },
  colMfr:   { width: 52 },
  colBank:  { width: 44, textAlign: 'center' },
  colCoin:  { width: 76, textAlign: 'right' },

  // Rank badge (top 3)
  rankBadge: {
    width: 32,
    height: 22,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadgeText: { fontSize: 10, fontWeight: '800', color: '#fff' },
  rankNum:  { fontSize: 12, fontWeight: '500', color: '#94a3b8', textAlign: 'center' },

  mcText:   { fontSize: 12, fontWeight: '700', color: NAVY, fontFamily: 'monospace' },
  gameText: { fontSize: 12, color: '#2d3e50' },
  mfrText:  { fontSize: 11, color: '#64748b' },
  bankText: { fontSize: 12, fontWeight: '600', color: '#4a5f7f', textAlign: 'center' },
  coinIn:   { fontSize: 13, fontWeight: '800', color: TEAL, textAlign: 'right' },
  coinZero: { fontSize: 12, color: '#94a3b8', textAlign: 'right' },

  emptyWrap: { alignItems: 'center', paddingVertical: 36 },
  emptyIcon: { fontSize: 32, marginBottom: 8 },
  empty:     { fontSize: 14, fontWeight: '600', color: '#94a3b8', textAlign: 'center' },
  emptyHint: { fontSize: 12, color: '#cbd5e1', textAlign: 'center', marginTop: 4 },
});
