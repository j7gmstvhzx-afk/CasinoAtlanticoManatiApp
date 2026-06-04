import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import { useSlotFloorStore } from '@/store/useSlotFloorStore';
import type { CoinInPeriod } from '@/types/domain';
import { tabStyles, NAVY, GOLD, TEAL, fmt$, bankOf, type TabProps } from './shared';
import { periodStart, toDateString } from '@/utils/dateRange';

const PERIODS: { key: CoinInPeriod; label: string }[] = [
  { key: 'ytd',        label: 'YTD' },
  { key: 'semiannual', label: '6 Meses' },
  { key: 'quarterly',  label: 'Trimestral' },
  { key: 'mtd',        label: 'MTD' },
];

const TYPE_COLOR = {
  compra:       TEAL,
  reubicacion:  GOLD,
  cambio_juego: '#8b5cf6',
};

const TYPE_LABEL = {
  compra:       '🛒 Compra',
  reubicacion:  '📦 Reubicación',
  cambio_juego: '🔄 Cambio',
};

export function BestChangesTab({ onEditMachine }: TabProps) {
  const [period, setPeriod]   = useState<CoinInPeriod>('ytd');
  const machines    = useSlotFloorStore(s => s.machines);
  const coinIn      = useSlotFloorStore(s => s.coinIn);
  const changes     = useSlotFloorStore(s => s.machineChanges);

  const fromStr = toDateString(periodStart(period));
  const toStr   = toDateString(new Date());

  // Build a set of machine IDs that appear in changes
  const changedMachineIds = new Set(changes.map(c => c.mc));

  // For each changed machine, compute coin-in and find its change record
  const results = machines
    .filter(m => changedMachineIds.has(m.id))
    .map(m => {
      const change = changes.find(c => c.mc === m.id);
      const total  = coinIn
        .filter(e => e.machineId === m.id && e.date >= fromStr && e.date <= toStr)
        .reduce((s, e) => s + e.amount, 0);
      return { machine: m, change, total };
    })
    .sort((a, b) => b.total - a.total);

  const topTotal = results.reduce((s, r) => s + r.total, 0);

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
        <View style={[tabStyles.kpiCard, { backgroundColor: 'rgba(212,165,116,0.09)', overflow: 'hidden' }]}>
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: GOLD, borderTopLeftRadius: 14, borderTopRightRadius: 14 }} />
          <Text style={[tabStyles.kpiLabel, { color: '#b8935f' }]}>Máquinas Cambiadas</Text>
          <Text style={tabStyles.kpiValue}>{results.length}</Text>
        </View>
        <View style={[tabStyles.kpiCard, { backgroundColor: 'rgba(42,157,143,0.06)', overflow: 'hidden' }]}>
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: TEAL, borderTopLeftRadius: 14, borderTopRightRadius: 14 }} />
          <Text style={[tabStyles.kpiLabel, { color: TEAL }]}>Coin-In Total</Text>
          <Text style={[tabStyles.kpiValue, { color: TEAL }]}>{fmt$(topTotal)}</Text>
        </View>
      </View>

      {/* Rankings */}
      <View style={tabStyles.card}>
        <Text style={tabStyles.cardTitle}>Mejores Cambios por Coin-In</Text>

        {/* Table header */}
        <View style={[styles.tRow, styles.tHeader]}>
          <Text style={[styles.cRank, styles.hText]}>#</Text>
          <Text style={[styles.cMc,   styles.hText]}>MC</Text>
          <Text style={[styles.cGame, styles.hText]}>Juego 2025</Text>
          <Text style={[styles.cType, styles.hText]}>Tipo</Text>
          <Text style={[styles.cBank, styles.hText]}>Banco</Text>
          <Text style={[styles.cCoin, styles.hText]}>Coin-In</Text>
        </View>

        {results.length === 0 ? (
          <Text style={styles.empty}>Sin datos para este período</Text>
        ) : (
          results.map(({ machine: m, change, total }, i) => {
            const typeKey = change?.type ?? 'compra';
            const color   = TYPE_COLOR[typeKey];
            return (
              <Pressable
                key={m.id}
                style={[styles.tRow, i === results.length - 1 && styles.tLast, i === 0 && styles.topRow]}
                onPress={() => onEditMachine(m)}
              >
                <Text style={[styles.cRank, i < 3 ? { color: GOLD, fontWeight: '700', textAlign: 'center', fontSize: 14 } : styles.rankNum]}>
                  {i + 1}
                </Text>
                <Text style={[styles.cMc, styles.mcText]}>{m.id}</Text>
                <Text style={[styles.cGame, styles.gameText]} numberOfLines={1}>{m.game}</Text>
                <View style={[styles.cType, styles.typeBadge, { backgroundColor: color + '18' }]}>
                  <Text style={{ fontSize: 8, fontWeight: '700', color, textAlign: 'center' }}>
                    {typeKey === 'compra' ? 'COMPRA' : typeKey === 'reubicacion' ? 'REUBIC.' : 'JUEGO'}
                  </Text>
                </View>
                <Text style={[styles.cBank, styles.bankText]}>{bankOf(m.location)}</Text>
                <Text style={[styles.cCoin, total > 0 ? { fontSize: 12, fontWeight: '700', color: TEAL, textAlign: 'right' } : styles.coinZero]}>
                  {fmt$(total)}
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
  tRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', gap: 4 },
  tHeader: { borderBottomWidth: 2, borderBottomColor: '#e2e8f0', paddingBottom: 8, marginBottom: 2 },
  tLast:   { borderBottomWidth: 0 },
  topRow:  { backgroundColor: '#fffbf2', borderRadius: 6, marginHorizontal: -4, paddingHorizontal: 4 },
  hText:   { fontSize: 9, fontWeight: '700', color: '#94a3b8', letterSpacing: 0.5, textTransform: 'uppercase' },
  cRank:   { width: 24, textAlign: 'center' },
  cMc:     { width: 48 },
  cGame:   { flex: 1 },
  cType:   { width: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 4, paddingVertical: 3 },
  cBank:   { width: 40, textAlign: 'center' },
  cCoin:   { width: 72, textAlign: 'right' },
  rankNum:  { fontSize: 12, color: '#94a3b8', textAlign: 'center' },
  mcText:   { fontSize: 11, fontWeight: '600', color: NAVY, fontFamily: 'monospace' },
  gameText: { fontSize: 11, color: '#2d3e50' },
  bankText: { fontSize: 11, fontWeight: '500', color: '#4a5f7f', textAlign: 'center' },
  coinZero: { fontSize: 11, color: '#94a3b8', textAlign: 'right' },
  typeBadge: {},
  empty:    { fontSize: 13, color: '#94a3b8', textAlign: 'center', paddingVertical: 24 },
});
