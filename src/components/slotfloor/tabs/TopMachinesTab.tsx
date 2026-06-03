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

export function TopMachinesTab({ onEditMachine }: TabProps) {
  const [period, setPeriod] = useState<CoinInPeriod>('ytd');
  const getTop = useSlotFloorStore(s => s.getTopMachinesByCoinIn);
  const top20  = getTop(period, 20);
  const total  = top20.reduce((s, r) => s + r.total, 0);

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
        <View style={[tabStyles.kpiCard, { borderLeftWidth: 3, borderLeftColor: GOLD }]}>
          <Text style={tabStyles.kpiLabel}>Total Coin-In</Text>
          <Text style={[tabStyles.kpiValue, { color: NAVY }]}>{fmt$(total)}</Text>
        </View>
        <View style={[tabStyles.kpiCard, { borderLeftWidth: 3, borderLeftColor: TEAL }]}>
          <Text style={tabStyles.kpiLabel}>Promedio Top 20</Text>
          <Text style={[tabStyles.kpiValue, { color: TEAL }]}>{fmt$(top20.length ? total / top20.length : 0)}</Text>
        </View>
      </View>

      {/* Table */}
      <View style={tabStyles.card}>
        <Text style={tabStyles.cardTitle}>Ranking · Top 20 Máquinas</Text>

        {/* Table header */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.colRank, styles.headerText]}>#</Text>
          <Text style={[styles.colMc,   styles.headerText]}>MC</Text>
          <Text style={[styles.colGame, styles.headerText]}>Juego</Text>
          <Text style={[styles.colMfr,  styles.headerText]}>Fab.</Text>
          <Text style={[styles.colBank, styles.headerText]}>Banco</Text>
          <Text style={[styles.colCoin, styles.headerText]}>Coin-In</Text>
        </View>

        {top20.length === 0 ? (
          <Text style={styles.empty}>Sin datos para este período</Text>
        ) : (
          top20.map(({ machine: m, total: coinIn }, i) => (
            <Pressable
              key={m.id}
              style={[styles.tableRow, i === top20.length - 1 && tabStyles.rowLast, i === 0 && styles.topRow]}
              onPress={() => onEditMachine(m)}
            >
              <Text style={[styles.colRank, i < 3 ? styles.rankTop : styles.rankNum]}>
                {i + 1}
              </Text>
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
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 4,
  },
  tableHeader: {
    borderBottomWidth: 2,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 8,
    marginBottom: 2,
  },
  topRow:     { backgroundColor: '#fffbf2', borderRadius: 6, marginHorizontal: -4, paddingHorizontal: 4 },
  headerText: { fontSize: 10, fontWeight: '700', color: '#94a3b8', letterSpacing: 0.6, textTransform: 'uppercase' },
  colRank:    { width: 28, textAlign: 'center' },
  colMc:      { width: 52 },
  colGame:    { flex: 1 },
  colMfr:     { width: 56 },
  colBank:    { width: 44, textAlign: 'center' },
  colCoin:    { width: 72, textAlign: 'right' },
  rankTop:    { fontSize: 13, fontWeight: '700', color: GOLD, textAlign: 'center' },
  rankNum:    { fontSize: 13, fontWeight: '500', color: '#94a3b8', textAlign: 'center' },
  mcText:     { fontSize: 12, fontWeight: '600', color: NAVY, fontFamily: 'monospace' },
  gameText:   { fontSize: 12, color: '#2d3e50' },
  mfrText:    { fontSize: 11, color: '#64748b' },
  bankText:   { fontSize: 12, fontWeight: '500', color: '#4a5f7f', textAlign: 'center' },
  coinIn:     { fontSize: 12, fontWeight: '700', color: TEAL, textAlign: 'right' },
  coinZero:   { fontSize: 12, color: '#94a3b8', textAlign: 'right' },
  empty:      { fontSize: 13, color: '#94a3b8', textAlign: 'center', paddingVertical: 24 },
});
