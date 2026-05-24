import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui';
import { colors, spacing, radius } from '@/theme';
import { useSlotFloorStore } from '@/store/useSlotFloorStore';
import { FloorKPI } from './FloorKPI';
import { FloorPieChart, PieItem } from './FloorPieChart';
import { FloorBarChart } from './FloorBarChart';

const TEAL = '#2a9d8f';

const MFR_COLORS: Record<string, string> = {
  'Light & Wonder': '#D4A24C',
  'Aristocrat':     '#3D6FB8',
  'IGT':            TEAL,
  'Konami':         '#8B5CF6',
  'Everi':          '#E5484D',
};

export function FloorOverview() {
  const stats = useSlotFloorStore(s => s.floorStats);

  const mfrPie: PieItem[] = stats.byManufacturer.map(({ name, count }) => ({
    label: name,
    value: count,
    color: MFR_COLORS[name] ?? '#888',
  }));

  const denoBars = stats.byDenomination.map(({ label, count }) => ({
    label,
    value: count,
  }));

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* KPI Grid */}
      <View style={styles.kpiRow}>
        <FloorKPI label="Total Máquinas" value={stats.total} tone="default" flex={1} />
        <FloorKPI label="Activas"        value={stats.active} tone="teal"    flex={1} />
      </View>
      <View style={styles.kpiRow}>
        <FloorKPI label="Easy Bet"   value={stats.easyBet}  tone="gold"    flex={1} />
        <FloorKPI label="Multi Line" value={stats.multiLine} tone="default" flex={1} />
      </View>
      <View style={styles.kpiRow}>
        <FloorKPI label="Multi-Deno"  value={stats.multiDeno}  tone="teal"    flex={1} />
        <FloorKPI label="Single-Deno" value={stats.singleDeno} tone="default" flex={1} />
      </View>

      {/* Manufacturer distribution */}
      <View style={styles.card}>
        <Text variant="h3" style={styles.cardTitle}>Distribución por Fabricante</Text>
        <FloorPieChart data={mfrPie} size={160} centerLabel="Fab." />
      </View>

      {/* Denomination breakdown */}
      <View style={styles.card}>
        <Text variant="h3" style={styles.cardTitle}>Denominaciones Base</Text>
        <FloorBarChart data={denoBars} color={TEAL} />
      </View>

      {/* Denomination options */}
      <View style={styles.card}>
        <Text variant="h3" style={styles.cardTitle}>Opciones de Juego por Denominación</Text>
        <View style={styles.denoGrid}>
          {[
            { deno: '1¢',  count: stats.active, note: 'Todas las máquinas' },
            { deno: '2¢',  count: stats.multiDeno, note: 'Solo Multi-Deno' },
            { deno: '5¢',  count: stats.multiDeno + (stats.byDenomination.find(d => d.label === '5¢')?.count ?? 0), note: 'Base + Multi-Deno' },
            { deno: '10¢', count: stats.multiDeno, note: 'Solo Multi-Deno' },
          ].map(item => (
            <View key={item.deno} style={styles.denoCard}>
              <Text variant="h3" style={{ color: TEAL }}>{item.deno}</Text>
              <Text variant="h2" style={{ fontWeight: '700' }}>{item.count}</Text>
              <Text variant="caption" tone="muted" align="center">{item.note}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: 120,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.default,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  cardTitle: {
    fontWeight: '700',
  },
  denoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  denoCard: {
    flex: 1,
    minWidth: 80,
    backgroundColor: 'rgba(42,157,143,0.08)',
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(42,157,143,0.25)',
    padding: spacing.md,
    alignItems: 'center',
    gap: 4,
  },
});
