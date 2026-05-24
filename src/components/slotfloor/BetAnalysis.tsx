import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui';
import { colors, spacing, radius } from '@/theme';
import { useSlotFloorStore } from '@/store/useSlotFloorStore';
import { FloorKPI } from './FloorKPI';
import { FloorBarChart } from './FloorBarChart';

const TEAL   = '#2a9d8f';
const GOLD   = '#D4A24C';
const VIOLET = '#8B5CF6';

export function BetAnalysis() {
  const stats = useSlotFloorStore(s => s.floorStats);
  const mb    = stats.minBetStats;
  const m01   = stats.maxBet01Stats;
  const m05   = stats.maxBet05Stats;

  const fmt = (n: number) => `$${n.toFixed(2)}`;

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* ── Min Bet Overview ── */}
      <View style={styles.section}>
        <Text variant="h3" style={styles.sectionTitle}>Apuestas Mínimas del Piso</Text>
        <View style={styles.row3}>
          <FloorKPI label="Más Bajo" value={fmt(mb.min)}  tone="teal"    flex={1} />
          <FloorKPI label="Promedio" value={fmt(mb.avg)}  tone="default" flex={1} />
          <FloorKPI label="Más Alto" value={fmt(mb.max)}  tone="gold"    flex={1} />
        </View>
        <View style={styles.rangeCard}>
          <Text variant="caption" tone="muted">RANGO</Text>
          <Text variant="h3" style={{ color: TEAL }}>{fmt(mb.min)} — {fmt(mb.max)}</Text>
        </View>
      </View>

      {/* ── Bet Categories ── */}
      <View style={styles.section}>
        <Text variant="h3" style={styles.sectionTitle}>Categorías de Apuesta</Text>
        <View style={styles.row2}>
          {/* Accessible */}
          <View style={[styles.catCard, { borderColor: 'rgba(42,157,143,0.35)' }]}>
            <View style={[styles.catBadge, { backgroundColor: 'rgba(42,157,143,0.15)' }]}>
              <Text variant="caption" style={{ color: TEAL }}>ACCESSIBLE BET</Text>
            </View>
            <Text variant="h2" style={{ fontWeight: '700' }}>{mb.accessibleCount}</Text>
            <Text variant="caption" tone="muted">$0.01 – $0.40</Text>
            <Text variant="small" tone="muted">Promedio: {fmt(mb.accessibleAvg)}</Text>
          </View>
          {/* High */}
          <View style={[styles.catCard, { borderColor: 'rgba(212,162,76,0.35)' }]}>
            <View style={[styles.catBadge, { backgroundColor: 'rgba(212,162,76,0.12)' }]}>
              <Text variant="caption" style={{ color: GOLD }}>HIGH BET</Text>
            </View>
            <Text variant="h2" style={{ fontWeight: '700' }}>{mb.highCount}</Text>
            <Text variant="caption" tone="muted">$0.50 – $1.00</Text>
            <Text variant="small" tone="muted">Promedio: {fmt(mb.highAvg)}</Text>
          </View>
        </View>
      </View>

      {/* ── Max Bet @ 1¢ ── */}
      {m01.distribution.length > 0 && (
        <View style={styles.section}>
          <Text variant="h3" style={styles.sectionTitle}>Max Bet @ 1¢</Text>
          <View style={styles.row3}>
            <FloorKPI label="Mínimo"  value={fmt(m01.min)} tone="default" flex={1} />
            <FloorKPI label="Promedio" value={fmt(m01.avg)} tone="teal"   flex={1} />
            <FloorKPI label="Máximo"  value={fmt(m01.max)} tone="gold"   flex={1} />
          </View>
          <FloorBarChart
            data={m01.distribution.map(d => ({ label: `$${d.value}`, value: d.count }))}
            color={TEAL}
            title="Distribución de valores"
          />
        </View>
      )}

      {/* ── Max Bet @ 5¢ ── */}
      {m05.distribution.length > 0 && (
        <View style={styles.section}>
          <Text variant="h3" style={styles.sectionTitle}>Max Bet @ 5¢</Text>
          <View style={styles.row3}>
            <FloorKPI label="Mínimo"  value={fmt(m05.min)} tone="default" flex={1} />
            <FloorKPI label="Promedio" value={fmt(m05.avg)} tone="teal"   flex={1} />
            <FloorKPI label="Máximo"  value={fmt(m05.max)} tone="gold"   flex={1} />
          </View>
          <FloorBarChart
            data={m05.distribution.map(d => ({ label: `$${d.value}`, value: d.count }))}
            color={VIOLET}
            title="Distribución de valores"
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.xl, paddingBottom: 120 },
  section: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.default,
    padding: spacing.lg,
    gap: spacing.md,
  },
  sectionTitle: { fontWeight: '700' },
  row3: { flexDirection: 'row', gap: spacing.sm },
  row2: { flexDirection: 'row', gap: spacing.md },
  rangeCard: {
    backgroundColor: 'rgba(42,157,143,0.08)',
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(42,157,143,0.25)',
    padding: spacing.md,
    gap: 4,
  },
  catCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    gap: 6,
    alignItems: 'flex-start',
  },
  catBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
});
