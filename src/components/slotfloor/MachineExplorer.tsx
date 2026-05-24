import React, { useState, useCallback } from 'react';
import {
  FlatList, Pressable, StyleSheet, TextInput, View, useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import { colors, spacing, radius } from '@/theme';
import { useSlotFloorStore } from '@/store/useSlotFloorStore';
import { MachineCard } from './MachineCard';
import { MachineEditSheet } from './MachineEditSheet';
import type { SlotMachine, SlotManufacturer, SlotMachineType } from '@/types/domain';

const TEAL = '#2a9d8f';

const MFR_FILTERS: Array<{ value: SlotManufacturer | null; label: string }> = [
  { value: null,             label: 'Todos' },
  { value: 'Light & Wonder', label: 'L&W' },
  { value: 'Aristocrat',     label: 'Arist.' },
  { value: 'IGT',            label: 'IGT' },
  { value: 'Konami',         label: 'Konami' },
  { value: 'Everi',          label: 'Everi' },
];

const TYPE_FILTERS: Array<{ value: SlotMachineType | null; label: string }> = [
  { value: null,         label: 'Todos' },
  { value: 'Easy Bet',   label: 'Easy Bet' },
  { value: 'Multi Line', label: 'Multi Line' },
];

const DENO_FILTERS: Array<{ value: string | null; label: string }> = [
  { value: null,          label: 'Todas' },
  { value: '0.01',        label: '1¢' },
  { value: '0.05',        label: '5¢' },
  { value: '0.25',        label: '25¢' },
  { value: '01/02/05/10', label: 'Multi' },
];

export function MachineExplorer() {
  const { width } = useWindowDimensions();
  const [editMachine, setEditMachine] = useState<SlotMachine | null>(null);
  const [showEdit, setShowEdit]       = useState(false);

  const explorerSearch  = useSlotFloorStore(s => s.explorerSearch);
  const explorerFilters = useSlotFloorStore(s => s.explorerFilters);
  const setSearch       = useSlotFloorStore(s => s.setExplorerSearch);
  const setFilter       = useSlotFloorStore(s => s.setExplorerFilter);
  const clearFilters    = useSlotFloorStore(s => s.clearExplorerFilters);
  const getFiltered     = useSlotFloorStore(s => s.getFilteredMachines);

  const machines = getFiltered();
  const numCols  = width >= 900 ? 3 : width >= 600 ? 2 : 1;

  const openEdit = useCallback((m: SlotMachine) => {
    setEditMachine(m);
    setShowEdit(true);
  }, []);

  const renderItem = useCallback(({ item }: { item: SlotMachine }) => (
    <View style={{ flex: 1 / numCols }}>
      <MachineCard machine={item} onPress={openEdit} />
    </View>
  ), [numCols, openEdit]);

  const hasFilters = !!explorerSearch || !!explorerFilters.manufacturer
    || !!explorerFilters.type || !!explorerFilters.denomination;

  return (
    <>
      <View style={styles.root}>
        {/* Search bar */}
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color={colors.text.muted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={explorerSearch}
            onChangeText={setSearch}
            placeholder="ID, juego, fabricante, ubicación..."
            placeholderTextColor={colors.text.muted}
            clearButtonMode="while-editing"
            returnKeyType="search"
          />
          {hasFilters && (
            <Pressable onPress={clearFilters} style={styles.clearBtn} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.text.muted} />
            </Pressable>
          )}
        </View>

        {/* Manufacturer filter */}
        <FlatList
          horizontal
          data={MFR_FILTERS}
          keyExtractor={i => String(i.value)}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
          renderItem={({ item }) => {
            const active = explorerFilters.manufacturer === item.value;
            return (
              <Pressable
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setFilter('manufacturer', item.value)}
              >
                <Text variant="caption" style={active ? { color: TEAL, fontWeight: '700' } : { color: colors.text.muted }}>
                  {item.label}
                </Text>
              </Pressable>
            );
          }}
        />

        {/* Type + Deno filters in one row */}
        <View style={styles.row}>
          <FlatList
            horizontal
            data={TYPE_FILTERS}
            keyExtractor={i => String(i.value)}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: spacing.xs }}
            style={{ flex: 1 }}
            renderItem={({ item }) => {
              const active = explorerFilters.type === item.value;
              return (
                <Pressable
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setFilter('type', item.value)}
                >
                  <Text variant="caption" style={active ? { color: TEAL, fontWeight: '700' } : { color: colors.text.muted }}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            }}
          />
          <FlatList
            horizontal
            data={DENO_FILTERS}
            keyExtractor={i => String(i.value)}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: spacing.xs }}
            style={{ flex: 1 }}
            renderItem={({ item }) => {
              const active = explorerFilters.denomination === item.value;
              return (
                <Pressable
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setFilter('denomination', item.value)}
                >
                  <Text variant="caption" style={active ? { color: TEAL, fontWeight: '700' } : { color: colors.text.muted }}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            }}
          />
        </View>

        {/* Count */}
        <View style={styles.countRow}>
          <Ionicons name="hardware-chip-outline" size={14} color={colors.text.muted} />
          <Text variant="caption" tone="muted">
            {machines.length} máquina{machines.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Machine list */}
        <FlatList
          key={numCols}
          data={machines}
          numColumns={numCols}
          keyExtractor={m => m.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          columnWrapperStyle={numCols > 1 ? styles.columnWrapper : undefined}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={40} color={colors.text.muted} />
              <Text variant="body" tone="muted" align="center">Sin resultados</Text>
              <Text variant="small" tone="muted" align="center">Prueba ajustando los filtros</Text>
            </View>
          }
        />
      </View>

      <MachineEditSheet
        machine={editMachine}
        visible={showEdit}
        onClose={() => setShowEdit(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  root:        { flex: 1 },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.default,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  searchIcon:  { marginRight: spacing.sm },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    color: colors.text.primary,
    fontSize: 15,
  },
  clearBtn:    { marginLeft: spacing.sm },
  filterRow:   { paddingHorizontal: spacing.lg, gap: spacing.xs, marginBottom: spacing.xs },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.subtle,
  },
  chipActive: {
    backgroundColor: 'rgba(42,157,143,0.12)',
    borderColor: 'rgba(42,157,143,0.45)',
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  list:          { paddingHorizontal: spacing.lg, paddingBottom: 120 },
  columnWrapper: { gap: spacing.sm },
  empty:         { paddingTop: 60, alignItems: 'center', gap: spacing.md },
});
