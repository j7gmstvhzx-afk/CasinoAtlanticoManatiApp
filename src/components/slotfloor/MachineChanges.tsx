import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import { colors, spacing, radius } from '@/theme';
import { machineChanges } from '@/data/machineChanges';
import type { MachineChange } from '@/types/domain';

const TEAL   = '#2a9d8f';
const GOLD   = '#D4A24C';
const VIOLET = '#8B5CF6';
const RUBY   = '#E5484D';

type Section = 'compra' | 'reubicacion' | 'cambio_juego';

const compras       = machineChanges.filter(c => c.type === 'compra');
const reubicaciones = machineChanges.filter(c => c.type === 'reubicacion');
const cambios       = machineChanges.filter(c => c.type === 'cambio_juego');

const SECTION_CONFIG = [
  { key: 'compra'       as Section, label: 'Compras',          count: compras.length,       color: TEAL,   icon: 'add-circle' as const },
  { key: 'reubicacion'  as Section, label: 'Reubicaciones',    count: reubicaciones.length, color: GOLD,   icon: 'swap-horizontal' as const },
  { key: 'cambio_juego' as Section, label: 'Cambios de Juego', count: cambios.length,       color: VIOLET, icon: 'game-controller' as const },
];

function ChangeRow({ item }: { item: MachineChange }) {
  return (
    <View style={styles.changeRow}>
      <View style={styles.changeLeft}>
        <Text variant="small" style={{ fontWeight: '600' }}>MC {item.mc}</Text>
        <Text variant="caption" tone="muted">{item.manufacturer}</Text>
      </View>
      <View style={styles.changeRight}>
        {item.type === 'compra' && (
          <>
            <Text variant="small" style={{ fontWeight: '600' }} numberOfLines={1}>{item.game2025}</Text>
            <Text variant="caption" style={{ color: TEAL }}>Nueva → {item.location2025}</Text>
          </>
        )}
        {item.type === 'reubicacion' && (
          <>
            <Text variant="small" style={{ fontWeight: '600' }} numberOfLines={1}>{item.game2025}</Text>
            <Text variant="caption" style={{ color: GOLD }}>
              {item.location2024} → {item.location2025}
            </Text>
          </>
        )}
        {item.type === 'cambio_juego' && (
          <>
            <Text variant="caption" tone="muted" numberOfLines={1} style={styles.strikethrough}>
              {item.game2024}
            </Text>
            <Text variant="small" style={{ fontWeight: '600' }} numberOfLines={1}>{item.game2025}</Text>
            <Text variant="caption" style={{ color: VIOLET }}>{item.location2025}</Text>
          </>
        )}
      </View>
    </View>
  );
}

function AccordionSection({
  section, items,
}: {
  section: typeof SECTION_CONFIG[number];
  items: MachineChange[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <View style={[styles.accordion, { borderColor: section.color + '44' }]}>
      <Pressable style={styles.accordionHeader} onPress={() => setOpen(o => !o)}>
        <View style={[styles.accordionBadge, { backgroundColor: section.color + '1A' }]}>
          <Ionicons name={section.icon} size={18} color={section.color} />
          <Text variant="bodyStrong" style={{ color: section.color }}>{section.count}</Text>
        </View>
        <Text variant="h3" style={styles.accordionLabel}>{section.label}</Text>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.text.muted}
        />
      </Pressable>

      {open && (
        <View style={styles.accordionBody}>
          {items.map(item => <ChangeRow key={item.mc + item.type} item={item} />)}
        </View>
      )}
    </View>
  );
}

export function MachineChanges() {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* Summary */}
      <View style={styles.summaryRow}>
        {SECTION_CONFIG.map(s => (
          <View key={s.key} style={[styles.summaryCard, { borderColor: s.color + '44' }]}>
            <Text variant="h1" style={{ color: s.color, fontWeight: '700' }}>{s.count}</Text>
            <Text variant="caption" tone="muted" align="center">{s.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.yearBadge}>
        <Ionicons name="calendar-outline" size={14} color={colors.text.muted} />
        <Text variant="caption" tone="muted">Cambios 2024 → 2025</Text>
      </View>

      {/* Accordions */}
      {SECTION_CONFIG.map((sec, i) => (
        <AccordionSection
          key={sec.key}
          section={sec}
          items={[compras, reubicaciones, cambios][i]}
        />
      ))}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content:   { padding: spacing.lg, gap: spacing.lg, paddingBottom: 120 },
  summaryRow: { flexDirection: 'row', gap: spacing.md },
  summaryCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    alignItems: 'center',
    gap: 4,
  },
  yearBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'center',
  },
  accordion: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.03)',
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  accordionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  accordionLabel: { flex: 1, fontWeight: '600' },
  accordionBody: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border.subtle,
  },
  changeRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.subtle,
    gap: spacing.md,
  },
  changeLeft:    { width: 90 },
  changeRight:   { flex: 1, gap: 2 },
  strikethrough: { textDecorationLine: 'line-through' },
});
