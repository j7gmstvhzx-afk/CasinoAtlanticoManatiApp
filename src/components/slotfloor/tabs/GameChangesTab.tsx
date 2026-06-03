import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import { useSlotFloorStore } from '@/store/useSlotFloorStore';
import { tabStyles, NAVY, GOLD, TEAL, type TabProps } from './shared';

const TYPE_META = {
  compra:       { label: 'Compras',          icon: 'cart-outline',         color: TEAL,   bg: '#f0faf9' },
  reubicacion:  { label: 'Reubicaciones',    icon: 'swap-horizontal-outline', color: GOLD, bg: '#fffbf2' },
  cambio_juego: { label: 'Cambios de Juego', icon: 'game-controller-outline', color: '#8b5cf6', bg: '#f5f3ff' },
} as const;

type ChangeType = keyof typeof TYPE_META;

export function GameChangesTab({ onEditMachine }: TabProps) {
  const changes     = useSlotFloorStore(s => s.machineChanges);
  const [open, setOpen] = useState<Set<ChangeType>>(new Set(['compra']));

  const grouped = {
    compra:       changes.filter(c => c.type === 'compra'),
    reubicacion:  changes.filter(c => c.type === 'reubicacion'),
    cambio_juego: changes.filter(c => c.type === 'cambio_juego'),
  };

  const toggle = (type: ChangeType) => {
    setOpen(prev => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  };

  return (
    <ScrollView style={tabStyles.container} contentContainerStyle={tabStyles.content}>
      {/* Summary KPIs */}
      <View style={tabStyles.kpiGrid}>
        {(Object.keys(grouped) as ChangeType[]).map(type => {
          const meta = TYPE_META[type];
          return (
            <View key={type} style={[tabStyles.kpiCard, { borderTopWidth: 3, borderTopColor: meta.color }]}>
              <Text style={tabStyles.kpiLabel}>{meta.label}</Text>
              <Text style={[tabStyles.kpiValue, { color: meta.color }]}>{grouped[type].length}</Text>
            </View>
          );
        })}
      </View>

      {/* Accordion sections */}
      {(Object.keys(grouped) as ChangeType[]).map(type => {
        const meta  = TYPE_META[type];
        const items = grouped[type];
        const isOpen = open.has(type);

        return (
          <View key={type} style={[tabStyles.card, { borderLeftWidth: 4, borderLeftColor: meta.color }]}>
            {/* Section header */}
            <Pressable style={styles.sectionHeader} onPress={() => toggle(type)}>
              <View style={styles.sectionLeft}>
                <View style={[styles.iconWrap, { backgroundColor: meta.bg }]}>
                  <Ionicons name={meta.icon as any} size={18} color={meta.color} />
                </View>
                <Text style={styles.sectionTitle}>{meta.label}</Text>
                <View style={[styles.countBadge, { backgroundColor: meta.bg }]}>
                  <Text style={[styles.countText, { color: meta.color }]}>{items.length}</Text>
                </View>
              </View>
              <Ionicons
                name={isOpen ? 'chevron-up' : 'chevron-down'}
                size={16}
                color="#94a3b8"
              />
            </Pressable>

            {/* Change rows */}
            {isOpen && (
              <View style={styles.changeList}>
                {items.length === 0 ? (
                  <Text style={styles.empty}>Sin registros</Text>
                ) : (
                  items.map((c, i) => (
                    <View key={c.mc} style={[styles.changeRow, i === items.length - 1 && styles.changeLast]}>
                      {/* MC + manufacturer */}
                      <View style={styles.changeLeft}>
                        <Text style={styles.mcText}>MC {c.mc}</Text>
                        <Text style={styles.mfrText}>{c.manufacturer}</Text>
                      </View>

                      {/* Change detail */}
                      <View style={styles.changeDetail}>
                        {type === 'compra' && (
                          <View style={styles.changeInfo}>
                            <Text style={[styles.gameNew, { color: meta.color }]}>{c.game2025}</Text>
                            <Text style={styles.locText}>→ {c.location2025}</Text>
                          </View>
                        )}
                        {type === 'reubicacion' && (
                          <View style={styles.changeInfo}>
                            <Text style={styles.gameSame}>{c.game2025}</Text>
                            <View style={styles.locRow}>
                              <Text style={styles.locOld}>{c.location2024}</Text>
                              <Ionicons name="arrow-forward" size={12} color={meta.color} />
                              <Text style={[styles.locNew, { color: meta.color }]}>{c.location2025}</Text>
                            </View>
                          </View>
                        )}
                        {type === 'cambio_juego' && (
                          <View style={styles.changeInfo}>
                            <Text style={styles.gameOld}>{c.game2024 ?? '—'}</Text>
                            <View style={styles.locRow}>
                              <Ionicons name="arrow-forward" size={12} color={meta.color} />
                              <Text style={[styles.gameNew, { color: meta.color }]}>{c.game2025}</Text>
                            </View>
                          </View>
                        )}
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionLeft:   { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconWrap:      { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  sectionTitle:  { fontSize: 15, fontWeight: '700', color: NAVY },
  countBadge:    { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  countText:     { fontSize: 11, fontWeight: '700' },
  changeList:    { marginTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 4 },
  changeRow:     { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f8f9fa', gap: 12 },
  changeLast:    { borderBottomWidth: 0 },
  changeLeft:    { width: 72 },
  changeDetail:  { flex: 1 },
  changeInfo:    { gap: 2 },
  mcText:        { fontSize: 11, fontWeight: '700', color: NAVY, fontFamily: 'monospace' },
  mfrText:       { fontSize: 10, color: '#94a3b8' },
  gameNew:       { fontSize: 12, fontWeight: '600' },
  gameOld:       { fontSize: 11, color: '#94a3b8', textDecorationLine: 'line-through' },
  gameSame:      { fontSize: 12, color: '#2d3e50' },
  locText:       { fontSize: 11, color: '#64748b' },
  locOld:        { fontSize: 11, color: '#94a3b8' },
  locNew:        { fontSize: 11, fontWeight: '600' },
  locRow:        { flexDirection: 'row', alignItems: 'center', gap: 4 },
  empty:         { fontSize: 13, color: '#94a3b8', textAlign: 'center', paddingVertical: 12 },
});
