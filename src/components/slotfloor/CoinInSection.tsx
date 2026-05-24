import React, { useState } from 'react';
import {
  KeyboardAvoidingView, Modal, Platform, Pressable,
  ScrollView, StyleSheet, TextInput, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import { colors, spacing, radius } from '@/theme';
import { useSlotFloorStore } from '@/store/useSlotFloorStore';
import { todayString } from '@/utils/dateRange';
import { formatCurrency } from '@/utils/format';
import type { CoinInPeriod } from '@/types/domain';

const TEAL = '#2a9d8f';
const GOLD = '#D4A24C';

type PeriodOption = { key: CoinInPeriod; label: string };
const PERIODS: PeriodOption[] = [
  { key: 'ytd',        label: 'Año (YTD)' },
  { key: 'mtd',        label: 'Mes (MTD)' },
  { key: 'quarterly',  label: 'Trimestral' },
  { key: 'semiannual', label: 'Semestral' },
  { key: 'annual',     label: 'Anual' },
];

export function CoinInSection() {
  const [period, setPeriod]       = useState<CoinInPeriod>('mtd');
  const [showModal, setShowModal] = useState(false);
  const [machineSearch, setMachineSearch] = useState('');
  const [selectedMachineId, setSelectedMachineId] = useState('');
  const [dateStr, setDateStr]     = useState(todayString());
  const [amountStr, setAmountStr] = useState('');

  const machines           = useSlotFloorStore(s => s.machines);
  const getPeriodTotal     = useSlotFloorStore(s => s.getPeriodTotal);
  const getTop             = useSlotFloorStore(s => s.getTopMachinesByCoinIn);
  const addOrUpdateCoinIn  = useSlotFloorStore(s => s.addOrUpdateCoinIn);

  const total   = getPeriodTotal(period);
  const topList = getTop(period, 10);
  const topMax  = topList[0]?.total ?? 1;

  const machineCount = machines.filter(m => m.active).length;
  const avg = machineCount > 0 ? total / machineCount : 0;

  const filteredMachines = machines.filter(m => {
    const q = machineSearch.toLowerCase();
    return !q || m.id.includes(q) || m.game.toLowerCase().includes(q);
  }).slice(0, 20);

  const handleSave = () => {
    const amount = parseFloat(amountStr);
    if (!selectedMachineId || !dateStr || isNaN(amount) || amount <= 0) return;
    addOrUpdateCoinIn({ machineId: selectedMachineId, date: dateStr, amount });
    setShowModal(false);
    setMachineSearch('');
    setSelectedMachineId('');
    setAmountStr('');
    setDateStr(todayString());
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Period selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.periodRow}>
          {PERIODS.map(p => (
            <Pressable
              key={p.key}
              style={[styles.periodChip, period === p.key && styles.periodChipActive]}
              onPress={() => setPeriod(p.key)}
            >
              <Text
                variant="small"
                style={[styles.periodLabel, period === p.key && styles.periodLabelActive]}
              >
                {p.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Hero total */}
        <View style={styles.heroCard}>
          <Text variant="caption" style={{ color: TEAL }}>COIN-IN TOTAL</Text>
          <Text variant="display" style={styles.heroAmount}>{formatCurrency(total)}</Text>
          <View style={styles.heroRow}>
            <View style={styles.heroStat}>
              <Text variant="caption" tone="muted">PROMEDIO / MÁQUINA</Text>
              <Text variant="h3" style={{ color: GOLD }}>{formatCurrency(avg)}</Text>
            </View>
            <View style={styles.heroStat}>
              <Text variant="caption" tone="muted">MÁQUINAS ACTIVAS</Text>
              <Text variant="h3">{machineCount}</Text>
            </View>
          </View>
        </View>

        {/* Top machines */}
        <View style={styles.topCard}>
          <Text variant="h3" style={styles.topTitle}>Top 10 — {PERIODS.find(p => p.key === period)?.label}</Text>
          {topList.map(({ machine, total: t }, i) => {
            const barPct = topMax > 0 ? t / topMax : 0;
            return (
              <View key={machine.id} style={styles.topRow}>
                <Text variant="small" tone="muted" style={styles.topRank}>#{i + 1}</Text>
                <View style={styles.topInfo}>
                  <Text variant="small" style={{ fontWeight: '600' }} numberOfLines={1}>
                    {machine.game}
                  </Text>
                  <View style={styles.topBarWrap}>
                    <View style={[styles.topBar, { width: `${barPct * 100}%` }]} />
                  </View>
                  <Text variant="caption" tone="muted">Máq. {machine.id} · {machine.location}</Text>
                </View>
                <Text variant="small" style={styles.topAmount}>{formatCurrency(t)}</Text>
              </View>
            );
          })}
        </View>

        {/* Register button */}
        <Pressable style={styles.addBtn} onPress={() => setShowModal(true)}>
          <Ionicons name="add-circle" size={20} color={colors.text.primary} />
          <Text variant="bodyStrong">Registrar Coin-In</Text>
        </Pressable>

      </ScrollView>

      {/* Entry Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowModal(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text variant="h3" style={styles.sheetTitle}>Registrar Coin-In</Text>

            {/* Machine search */}
            <Text variant="small" tone="muted">Buscar máquina</Text>
            <TextInput
              style={styles.input}
              placeholder="ID o nombre del juego..."
              placeholderTextColor={colors.text.muted}
              value={machineSearch}
              onChangeText={setMachineSearch}
              returnKeyType="search"
            />
            {machineSearch.length > 0 && (
              <View style={styles.machineList}>
                {filteredMachines.map(m => (
                  <Pressable
                    key={m.id}
                    style={[
                      styles.machineRow,
                      selectedMachineId === m.id && styles.machineRowSelected,
                    ]}
                    onPress={() => { setSelectedMachineId(m.id); setMachineSearch(`${m.id} — ${m.game}`); }}
                  >
                    <Text variant="small" style={{ fontWeight: '600' }}>{m.id}</Text>
                    <Text variant="caption" tone="muted" numberOfLines={1}>{m.game}</Text>
                  </Pressable>
                ))}
              </View>
            )}

            {/* Date */}
            <Text variant="small" tone="muted">Fecha (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              value={dateStr}
              onChangeText={setDateStr}
              placeholder="2025-05-24"
              placeholderTextColor={colors.text.muted}
              keyboardType="numbers-and-punctuation"
            />

            {/* Amount */}
            <Text variant="small" tone="muted">Coin-In ($)</Text>
            <TextInput
              style={styles.input}
              value={amountStr}
              onChangeText={setAmountStr}
              placeholder="1250.00"
              placeholderTextColor={colors.text.muted}
              keyboardType="decimal-pad"
            />

            <View style={styles.sheetBtns}>
              <Pressable style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                <Text variant="bodyStrong" tone="muted">Cancelar</Text>
              </Pressable>
              <Pressable style={styles.saveBtn} onPress={handleSave}>
                <Text variant="bodyStrong" style={{ color: colors.text.primary }}>Guardar</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: 120 },
  periodRow: { gap: spacing.sm, paddingBottom: spacing.sm },
  periodChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.default,
  },
  periodChipActive: {
    backgroundColor: 'rgba(42,157,143,0.20)',
    borderColor: 'rgba(42,157,143,0.50)',
  },
  periodLabel:       { color: colors.text.muted, fontWeight: '600' },
  periodLabelActive: { color: TEAL },
  heroCard: {
    backgroundColor: 'rgba(42,157,143,0.08)',
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(42,157,143,0.30)',
    padding: spacing.xl,
    gap: spacing.md,
  },
  heroAmount: { fontWeight: '700', color: colors.text.primary },
  heroRow:   { flexDirection: 'row', gap: spacing.xl },
  heroStat:  { gap: 2 },
  topCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.default,
    padding: spacing.lg,
    gap: spacing.md,
  },
  topTitle: { fontWeight: '700' },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border.subtle,
  },
  topRank:    { width: 28, fontWeight: '700', color: colors.text.muted },
  topInfo:    { flex: 1, gap: 3 },
  topBarWrap: { height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' },
  topBar:     { height: 4, borderRadius: 2, backgroundColor: TEAL },
  topAmount:  { color: GOLD, fontWeight: '600', fontSize: 12 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: TEAL,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.60)',
  },
  sheet: {
    backgroundColor: colors.bg.elevated,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.md,
    paddingBottom: 40,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border.strong,
    marginBottom: spacing.sm,
  },
  sheetTitle: { fontWeight: '700', marginBottom: spacing.sm },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.default,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: colors.text.primary,
    fontSize: 15,
  },
  machineList: {
    maxHeight: 160,
    backgroundColor: colors.bg.raised,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.default,
    overflow: 'hidden',
  },
  machineRow: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.subtle,
  },
  machineRowSelected: { backgroundColor: 'rgba(42,157,143,0.15)' },
  sheetBtns: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  cancelBtn: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
  },
  saveBtn: {
    flex: 2,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: TEAL,
    alignItems: 'center',
  },
});
