import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui';
import { FloorPieChart, type PieItem } from '../FloorPieChart';
import { useSlotFloorStore } from '@/store/useSlotFloorStore';
import type { CoinInPeriod } from '@/types/domain';
import { tabStyles, NAVY, GOLD, TEAL, fmt$, type TabProps } from './shared';
import { periodStart, toDateString } from '@/utils/dateRange';

const MFR_COLORS: Record<string, string> = {
  'Light & Wonder': GOLD,
  'Aristocrat':     TEAL,
  'IGT':            '#3D6FB8',
  'Konami':         '#8b5cf6',
  'Everi':          '#e5484d',
};

const PERIODS: { key: CoinInPeriod; label: string }[] = [
  { key: 'ytd',        label: 'YTD' },
  { key: 'semiannual', label: '6 Meses' },
  { key: 'quarterly',  label: 'Trimestral' },
  { key: 'mtd',        label: 'MTD' },
];

export function ManufacturerTab({ onEditMachine }: TabProps) {
  const [period, setPeriod] = useState<CoinInPeriod>('ytd');
  const machines    = useSlotFloorStore(s => s.machines);
  const coinIn      = useSlotFloorStore(s => s.coinIn);
  const floorStats  = useSlotFloorStore(s => s.floorStats);

  const fromStr = toDateString(periodStart(period));
  const toStr   = toDateString(new Date());

  // Coin-in per manufacturer
  const coinByMfr = new Map<string, number>();
  for (const m of machines) {
    const mfrCoin = coinIn
      .filter(e => e.machineId === m.id && e.date >= fromStr && e.date <= toStr)
      .reduce((s, e) => s + e.amount, 0);
    coinByMfr.set(m.manufacturer, (coinByMfr.get(m.manufacturer) ?? 0) + mfrCoin);
  }
  const totalCoinIn = Array.from(coinByMfr.values()).reduce((s, v) => s + v, 0);

  const pieData: PieItem[] = floorStats.byManufacturer.map(({ name, count }) => ({
    label: name.replace('Light & Wonder', 'L&W'),
    value: count,
    color: MFR_COLORS[name] ?? '#94a3b8',
  }));

  return (
    <ScrollView style={tabStyles.container} contentContainerStyle={tabStyles.content}>
      {/* KPIs */}
      <View style={tabStyles.kpiGrid}>
        <View style={[tabStyles.kpiCard, { backgroundColor: 'rgba(212,165,116,0.09)', overflow: 'hidden' }]}>
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: GOLD, borderTopLeftRadius: 14, borderTopRightRadius: 14 }} />
          <Text style={[tabStyles.kpiLabel, { color: '#b8935f' }]}>Fabricantes</Text>
          <Text style={tabStyles.kpiValue}>{floorStats.byManufacturer.length}</Text>
        </View>
        <View style={[tabStyles.kpiCard, { overflow: 'hidden' }]}>
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: NAVY, borderTopLeftRadius: 14, borderTopRightRadius: 14 }} />
          <Text style={tabStyles.kpiLabel}>Total Máquinas</Text>
          <Text style={tabStyles.kpiValue}>{floorStats.total}</Text>
        </View>
        <View style={[tabStyles.kpiCard, { backgroundColor: 'rgba(42,157,143,0.06)', overflow: 'hidden' }]}>
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: TEAL, borderTopLeftRadius: 14, borderTopRightRadius: 14 }} />
          <Text style={[tabStyles.kpiLabel, { color: TEAL }]}>Activas</Text>
          <Text style={[tabStyles.kpiValue, { color: TEAL }]}>{floorStats.active}</Text>
        </View>
      </View>

      {/* Pie chart */}
      <View style={tabStyles.card}>
        <Text style={tabStyles.cardTitle}>Distribución por Fabricante</Text>
        <FloorPieChart data={pieData} size={180} centerLabel={`${floorStats.active}\nmáqs.`} />
      </View>

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

      {/* Per-manufacturer stats */}
      {floorStats.byManufacturer.map(({ name, count }) => {
        const color   = MFR_COLORS[name] ?? '#94a3b8';
        const mfrCoin = coinByMfr.get(name) ?? 0;
        const share   = floorStats.active > 0 ? (count / floorStats.active) * 100 : 0;
        const coinPct = totalCoinIn > 0 ? (mfrCoin / totalCoinIn) * 100 : 0;
        return (
          <View key={name} style={[tabStyles.card, { borderLeftWidth: 4, borderLeftColor: color }]}>
            <View style={styles.mfrHeader}>
              <Text style={styles.mfrName}>{name}</Text>
              <Text style={[styles.mfrCoin, { color }]}>{fmt$(mfrCoin)}</Text>
            </View>
            <View style={styles.mfrStats}>
              <View style={styles.mfrStat}>
                <Text style={styles.mfrStatLabel}>MÁQUINAS</Text>
                <Text style={[styles.mfrStatValue, { color }]}>{count}</Text>
                <Text style={styles.mfrStatSub}>{share.toFixed(1)}% del piso</Text>
              </View>
              <View style={styles.mfrStat}>
                <Text style={styles.mfrStatLabel}>COIN-IN SHARE</Text>
                <Text style={[styles.mfrStatValue, { color }]}>{coinPct.toFixed(1)}%</Text>
                <Text style={styles.mfrStatSub}>del período</Text>
              </View>
              <View style={styles.mfrStat}>
                <Text style={styles.mfrStatLabel}>PROMEDIO</Text>
                <Text style={[styles.mfrStatValue, { color }]}>{fmt$(count > 0 ? mfrCoin / count : 0)}</Text>
                <Text style={styles.mfrStatSub}>por máquina</Text>
              </View>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  mfrHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mfrName: { fontSize: 16, fontWeight: '700', color: NAVY },
  mfrCoin: { fontSize: 16, fontWeight: '800' },
  mfrStats: { flexDirection: 'row', gap: 8 },
  mfrStat:  { flex: 1, alignItems: 'center' },
  mfrStatLabel: { fontSize: 9, fontWeight: '700', color: '#94a3b8', letterSpacing: 0.5, textTransform: 'uppercase', textAlign: 'center', marginBottom: 2 },
  mfrStatValue: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  mfrStatSub:   { fontSize: 10, color: '#94a3b8', textAlign: 'center', marginTop: 1 },
});
