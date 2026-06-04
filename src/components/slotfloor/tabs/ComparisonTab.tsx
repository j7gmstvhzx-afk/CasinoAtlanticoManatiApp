import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import { useSlotFloorStore } from '@/store/useSlotFloorStore';
import type { MachineChange } from '@/types/domain';
import { tabStyles, NAVY, GOLD, TEAL, type TabProps } from './shared';

type Filter = 'all' | MachineChange['type'];

const FILTER_OPTIONS: { key: Filter; label: string }[] = [
  { key: 'all',         label: 'Todos' },
  { key: 'compra',       label: 'Compras' },
  { key: 'reubicacion',  label: 'Reubicaciones' },
  { key: 'cambio_juego', label: 'Cambios' },
];

const TYPE_COLOR: Record<MachineChange['type'], string> = {
  compra:       TEAL,
  reubicacion:  GOLD,
  cambio_juego: '#8b5cf6',
};

const TYPE_LABEL: Record<MachineChange['type'], string> = {
  compra:       'COMPRA',
  reubicacion:  'REUBIC.',
  cambio_juego: 'JUEGO',
};

export function ComparisonTab({ onEditMachine }: TabProps) {
  const changes = useSlotFloorStore(s => s.machineChanges);
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = filter === 'all' ? changes : changes.filter(c => c.type === filter);

  const counts = {
    compra:       changes.filter(c => c.type === 'compra').length,
    reubicacion:  changes.filter(c => c.type === 'reubicacion').length,
    cambio_juego: changes.filter(c => c.type === 'cambio_juego').length,
  };

  return (
    <ScrollView style={tabStyles.container} contentContainerStyle={tabStyles.content}>
      {/* Summary */}
      <View style={tabStyles.kpiGrid}>
        <View style={[tabStyles.kpiCard, { backgroundColor: 'rgba(42,157,143,0.06)', overflow: 'hidden' }]}>
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: TEAL, borderTopLeftRadius: 14, borderTopRightRadius: 14 }} />
          <Text style={[tabStyles.kpiLabel, { color: TEAL }]}>Compras</Text>
          <Text style={[tabStyles.kpiValue, { color: TEAL }]}>{counts.compra}</Text>
        </View>
        <View style={[tabStyles.kpiCard, { backgroundColor: 'rgba(212,165,116,0.09)', overflow: 'hidden' }]}>
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: GOLD, borderTopLeftRadius: 14, borderTopRightRadius: 14 }} />
          <Text style={[tabStyles.kpiLabel, { color: '#b8935f' }]}>Reubicaciones</Text>
          <Text style={[tabStyles.kpiValue, { color: '#b8935f' }]}>{counts.reubicacion}</Text>
        </View>
        <View style={[tabStyles.kpiCard, { backgroundColor: 'rgba(139,92,246,0.06)', overflow: 'hidden' }]}>
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: '#8b5cf6', borderTopLeftRadius: 14, borderTopRightRadius: 14 }} />
          <Text style={[tabStyles.kpiLabel, { color: '#8b5cf6' }]}>Cambios</Text>
          <Text style={[tabStyles.kpiValue, { color: '#8b5cf6' }]}>{counts.cambio_juego}</Text>
        </View>
      </View>

      {/* Filter */}
      <View style={tabStyles.periodBar}>
        {FILTER_OPTIONS.map(f => (
          <Pressable
            key={f.key}
            style={[tabStyles.periodChip, filter === f.key && tabStyles.periodChipActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[tabStyles.periodChipText, filter === f.key && tabStyles.periodChipTextActive]}>
              {f.label} {f.key !== 'all' ? `(${counts[f.key as MachineChange['type']]})` : `(${changes.length})`}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Table */}
      <View style={tabStyles.card}>
        <Text style={tabStyles.cardTitle}>Comparativa 2024 → 2025</Text>

        {/* Table header */}
        <View style={[styles.tRow, styles.tHeader]}>
          <Text style={[styles.cMc,   styles.hText]}>MC</Text>
          <Text style={[styles.cType, styles.hText]}>Tipo</Text>
          <Text style={[styles.cGame, styles.hText]}>Juego 2024</Text>
          <Text style={[styles.cArrow, styles.hText]}> </Text>
          <Text style={[styles.cGame, styles.hText]}>Juego 2025</Text>
          <Text style={[styles.cLoc,  styles.hText]}>Loc 24</Text>
          <Text style={[styles.cArrow, styles.hText]}> </Text>
          <Text style={[styles.cLoc,  styles.hText]}>Loc 25</Text>
        </View>

        {filtered.length === 0 ? (
          <Text style={styles.empty}>Sin registros</Text>
        ) : (
          filtered.map((c, i) => {
            const color = TYPE_COLOR[c.type];
            return (
              <View key={c.mc} style={[styles.tRow, i === filtered.length - 1 && styles.tLast]}>
                <Text style={[styles.cMc, styles.mcText]}>{c.mc}</Text>
                <View style={[styles.cType, styles.typeBadge, { backgroundColor: color + '18', borderColor: color + '44' }]}>
                  <Text style={[styles.typeText, { color }]}>{TYPE_LABEL[c.type]}</Text>
                </View>
                <Text style={[styles.cGame, styles.game24]} numberOfLines={1}>{c.game2024 ?? '—'}</Text>
                <Ionicons name="arrow-forward" size={10} color="#94a3b8" style={styles.cArrow} />
                <Text style={[styles.cGame, styles.game25, { color }]} numberOfLines={1}>{c.game2025}</Text>
                <Text style={[styles.cLoc, styles.loc24]} numberOfLines={1}>{c.location2024 ?? '—'}</Text>
                <Ionicons name="arrow-forward" size={10} color="#94a3b8" style={styles.cArrow} />
                <Text style={[styles.cLoc, styles.loc25, { color }]} numberOfLines={1}>{c.location2025}</Text>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', gap: 4 },
  tHeader: { borderBottomWidth: 2, borderBottomColor: '#e2e8f0', paddingBottom: 7, marginBottom: 2 },
  tLast:   { borderBottomWidth: 0 },
  hText:   { fontSize: 9, fontWeight: '700', color: '#94a3b8', letterSpacing: 0.5, textTransform: 'uppercase' },
  cMc:     { width: 44 },
  cType:   { width: 56, alignItems: 'center', justifyContent: 'center' },
  cGame:   { flex: 1 },
  cLoc:    { width: 44 },
  cArrow:  { width: 16, textAlign: 'center' },
  typeBadge: { borderRadius: 4, paddingVertical: 2, paddingHorizontal: 3, borderWidth: 1 },
  typeText:  { fontSize: 8, fontWeight: '700', letterSpacing: 0.4, textAlign: 'center' },
  mcText:  { fontSize: 11, fontWeight: '600', color: NAVY, fontFamily: 'monospace' },
  game24:  { fontSize: 10, color: '#94a3b8', textDecorationLine: 'line-through' },
  game25:  { fontSize: 10, fontWeight: '600' },
  loc24:   { fontSize: 10, color: '#94a3b8', textAlign: 'center' },
  loc25:   { fontSize: 10, fontWeight: '600', textAlign: 'center' },
  empty:   { fontSize: 13, color: '#94a3b8', textAlign: 'center', paddingVertical: 24 },
});
