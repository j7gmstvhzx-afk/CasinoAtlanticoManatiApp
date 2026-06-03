import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import { useSlotFloorStore } from '@/store/useSlotFloorStore';
import type { SlotManufacturer, SlotMachineType } from '@/types/domain';
import { tabStyles, NAVY, GOLD, TEAL, BORDER, fmtDeno, bankOf, type TabProps } from './shared';

const MFRS: SlotManufacturer[] = ['Light & Wonder', 'Aristocrat', 'IGT', 'Konami', 'Everi'];
const TYPES: SlotMachineType[] = ['Easy Bet', 'Multi Line'];
const DENOMS = [
  { value: '0.01',        label: '1¢' },
  { value: '0.05',        label: '5¢' },
  { value: '0.25',        label: '25¢' },
  { value: '01/02/05/10', label: 'Multi' },
];

export function AllMachinesTab({ onEditMachine }: TabProps) {
  const machines       = useSlotFloorStore(s => s.machines);
  const search         = useSlotFloorStore(s => s.explorerSearch);
  const filters        = useSlotFloorStore(s => s.explorerFilters);
  const setSearch      = useSlotFloorStore(s => s.setExplorerSearch);
  const setFilter      = useSlotFloorStore(s => s.setExplorerFilter);
  const clearFilters   = useSlotFloorStore(s => s.clearExplorerFilters);
  const getFiltered    = useSlotFloorStore(s => s.getFilteredMachines);

  const filtered = getFiltered();
  const hasFilters = search || filters.manufacturer || filters.type || filters.denomination;

  return (
    <ScrollView style={tabStyles.container} contentContainerStyle={tabStyles.content} keyboardShouldPersistTaps="handled">
      {/* Search + filters */}
      <View style={tabStyles.card}>
        {/* Search bar */}
        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={16} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por MC, juego, fabricante..."
            placeholderTextColor="#94a3b8"
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color="#94a3b8" />
            </Pressable>
          ) : null}
        </View>

        {/* Manufacturer filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar}>
          {MFRS.map(mfr => (
            <Pressable
              key={mfr}
              style={[styles.filterChip, filters.manufacturer === mfr && styles.filterChipActive]}
              onPress={() => setFilter('manufacturer', filters.manufacturer === mfr ? null : mfr)}
            >
              <Text style={[styles.filterText, filters.manufacturer === mfr && styles.filterTextActive]}>
                {mfr.replace('Light & Wonder', 'L&W')}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Type + deno filters */}
        <View style={styles.filterRow}>
          {TYPES.map(t => (
            <Pressable
              key={t}
              style={[styles.filterChip, filters.type === t && styles.filterChipActive]}
              onPress={() => setFilter('type', filters.type === t ? null : t)}
            >
              <Text style={[styles.filterText, filters.type === t && styles.filterTextActive]}>{t}</Text>
            </Pressable>
          ))}
          {DENOMS.map(d => (
            <Pressable
              key={d.value}
              style={[styles.filterChip, filters.denomination === d.value && styles.filterChipActive]}
              onPress={() => setFilter('denomination', filters.denomination === d.value ? null : d.value)}
            >
              <Text style={[styles.filterText, filters.denomination === d.value && styles.filterTextActive]}>
                {d.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Results count + clear */}
        <View style={styles.resultsRow}>
          <Text style={styles.resultsText}>
            {filtered.length} de {machines.length} máquinas
          </Text>
          {hasFilters && (
            <Pressable onPress={clearFilters}>
              <Text style={styles.clearText}>Limpiar filtros</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Table */}
      <View style={tabStyles.card}>
        {/* Header */}
        <View style={[styles.tRow, styles.tHeader]}>
          <Text style={[styles.cMc,   styles.hText]}>MC</Text>
          <Text style={[styles.cGame, styles.hText]}>Juego</Text>
          <Text style={[styles.cMfr,  styles.hText]}>Fab.</Text>
          <Text style={[styles.cDeno, styles.hText]}>Deno</Text>
          <Text style={[styles.cBank, styles.hText]}>Banco</Text>
          <Text style={[styles.cPer,  styles.hText]}>Período</Text>
          <Text style={[styles.cStat, styles.hText]}>Est.</Text>
        </View>

        {filtered.length === 0 && (
          <Text style={styles.empty}>Sin resultados</Text>
        )}

        {filtered.map((m, i) => (
          <Pressable
            key={m.id}
            style={[styles.tRow, i === filtered.length - 1 && styles.tLast]}
            onPress={() => onEditMachine(m)}
          >
            <Text style={[styles.cMc, styles.mcText]}>{m.id}</Text>
            <Text style={[styles.cGame, styles.gameText]} numberOfLines={1}>{m.game}</Text>
            <Text style={[styles.cMfr,  styles.mfrText]} numberOfLines={1}>
              {m.manufacturer.replace('Light & Wonder', 'L&W')}
            </Text>
            <Text style={[styles.cDeno, styles.denoText]}>{fmtDeno(m.denomination)}</Text>
            <Text style={[styles.cBank, styles.bankText]}>{bankOf(m.location)}</Text>
            <Text style={[styles.cPer,  styles.perText]} numberOfLines={1}>{m.period ?? '—'}</Text>
            <View style={[styles.cStat, styles.dot, { backgroundColor: m.active ? '#dcfce7' : '#fee2e2' }]}>
              <Text style={{ fontSize: 8, fontWeight: '700', color: m.active ? '#16a34a' : '#dc2626' }}>
                {m.active ? '●' : '○'}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  searchRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, borderWidth: 1, borderColor: BORDER, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: '#f8f9fa' },
  searchInput: { flex: 1, fontSize: 14, color: NAVY, padding: 0 },
  filterBar:   { marginBottom: 8 },
  filterRow:   { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  filterChip:  { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999, backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: BORDER, marginRight: 6 },
  filterChipActive: { backgroundColor: NAVY, borderColor: NAVY },
  filterText:       { fontSize: 12, fontWeight: '500', color: '#64748b' },
  filterTextActive: { color: '#ffffff', fontWeight: '600' },
  resultsRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultsText: { fontSize: 12, color: '#94a3b8' },
  clearText:   { fontSize: 12, fontWeight: '600', color: TEAL },
  tRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', gap: 4 },
  tHeader: { borderBottomWidth: 2, borderBottomColor: '#e2e8f0', paddingBottom: 8, marginBottom: 2 },
  tLast:   { borderBottomWidth: 0 },
  hText:   { fontSize: 9, fontWeight: '700', color: '#94a3b8', letterSpacing: 0.5, textTransform: 'uppercase' },
  cMc:     { width: 48 },
  cGame:   { flex: 1 },
  cMfr:    { width: 52 },
  cDeno:   { width: 40, textAlign: 'center' },
  cBank:   { width: 40, textAlign: 'center' },
  cPer:    { width: 68 },
  cStat:   { width: 24, alignItems: 'center', justifyContent: 'center' },
  mcText:   { fontSize: 11, fontWeight: '600', color: NAVY, fontFamily: 'monospace' },
  gameText: { fontSize: 11, color: '#2d3e50' },
  mfrText:  { fontSize: 10, color: '#64748b' },
  denoText: { fontSize: 11, color: '#64748b', textAlign: 'center' },
  bankText: { fontSize: 11, fontWeight: '500', color: '#4a5f7f', textAlign: 'center' },
  perText:  { fontSize: 10, color: '#94a3b8' },
  dot:      { borderRadius: 12, paddingVertical: 3, paddingHorizontal: 3 },
  empty:    { fontSize: 13, color: '#94a3b8', textAlign: 'center', paddingVertical: 24 },
});
