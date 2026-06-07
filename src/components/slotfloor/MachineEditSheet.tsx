import React, { useState, useEffect } from 'react';
import {
  KeyboardAvoidingView, Modal, Platform, Pressable,
  ScrollView, StyleSheet, Switch, TextInput, View,
} from 'react-native';
import { Text } from '@/components/ui';
import { spacing, radius } from '@/theme';
import { useSlotFloorStore } from '@/store/useSlotFloorStore';
import { useAuthStore } from '@/store/useAuthStore';
import type { SlotMachine, SlotManufacturer, SlotMachineType } from '@/types/domain';

const NAVY   = '#1a2332';
const GOLD   = '#d4a574';
const TEAL   = '#2a9d8f';
const BORDER = '#e2e8f0';
const BG     = '#f8f9fa';

const MANUFACTURERS: SlotManufacturer[] = [
  'Light & Wonder', 'Aristocrat', 'Konami', 'Ainsworth', 'IGT', 'WMS', 'Everi',
];
const TYPES: SlotMachineType[] = ['Easy Bet', 'Multi Line'];
const DENOMS = [
  { value: '0.01',        label: '1¢' },
  { value: '0.05',        label: '5¢' },
  { value: '0.25',        label: '25¢' },
  { value: '01/02/05/10', label: 'Multi' },
];

type Props = {
  machine: SlotMachine | null;
  visible: boolean;
  onClose: () => void;
};

type Draft = {
  game:         string;
  manufacturer: SlotManufacturer;
  type:         SlotMachineType;
  minBet:       string;
  denomination: string;
  maxBet01:     string;
  maxBet02:     string;
  maxBet05:     string;
  maxBet10:     string;
  avgCoinIn:    string;
  avgWin:       string;
  active:       boolean;
  period:       string;
  periodStart:  string;
  periodEnd:    string;
};

function toDraft(m: SlotMachine): Draft {
  return {
    game:         m.game,
    manufacturer: m.manufacturer,
    type:         m.type,
    minBet:       m.minBet.toFixed(2),
    denomination: m.denomination,
    maxBet01:     m.maxBet01 != null ? m.maxBet01.toFixed(2) : '',
    maxBet02:     m.maxBet02 != null ? m.maxBet02.toFixed(2) : '',
    maxBet05:     m.maxBet05 != null ? m.maxBet05.toFixed(2) : '',
    maxBet10:     m.maxBet10 != null ? m.maxBet10.toFixed(2) : '',
    avgCoinIn:    m.avgCoinIn != null ? m.avgCoinIn.toFixed(2) : '',
    avgWin:       m.avgWin    != null ? m.avgWin.toFixed(2)    : '',
    active:       m.active,
    period:       m.period      ?? '',
    periodStart:  m.periodStart ?? '',
    periodEnd:    m.periodEnd   ?? '',
  };
}

function applyDraft(m: SlotMachine, d: Draft): Partial<SlotMachine> {
  const isMulti  = d.denomination === '01/02/05/10';
  const is5c     = d.denomination === '0.05';
  const is25c    = d.denomination === '0.25';
  const avgCoinIn = parseFloat(d.avgCoinIn);
  const avgWin    = parseFloat(d.avgWin);
  return {
    game:         d.game.trim() || m.game,
    manufacturer: d.manufacturer,
    type:         d.type,
    minBet:       parseFloat(d.minBet)  || m.minBet,
    denomination: d.denomination,
    multiDeno:    isMulti,
    maxBet01: !is5c && !is25c         ? (parseFloat(d.maxBet01) || null) : null,
    maxBet02: isMulti                 ? (parseFloat(d.maxBet02) || null) : null,
    maxBet05: (is5c || isMulti)       ? (parseFloat(d.maxBet05) || null) : null,
    maxBet10: isMulti                 ? (parseFloat(d.maxBet10) || null) : null,
    avgCoinIn: !isNaN(avgCoinIn)      ? avgCoinIn : m.avgCoinIn,
    avgWin:    !isNaN(avgWin)         ? avgWin    : m.avgWin,
    active:       d.active,
    period:       d.period.trim()      === '' ? null : d.period.trim(),
    periodStart:  d.periodStart.trim() === '' ? null : d.periodStart.trim(),
    periodEnd:    d.periodEnd.trim()   === '' ? null : d.periodEnd.trim(),
  };
}

export function MachineEditSheet({ machine, visible, onClose }: Props) {
  const updateMachine = useSlotFloorStore(s => s.updateMachine);
  const role          = useAuthStore(s => s.profile?.role);
  const isAdmin       = role === 'admin';
  const [draft, setDraft] = useState<Draft | null>(null);

  useEffect(() => {
    if (machine) setDraft(toDraft(machine));
  }, [machine]);

  if (!machine || !draft) return null;

  const isMultiDeno = draft.denomination === '01/02/05/10';
  const isBase5c    = draft.denomination === '0.05';
  const isBase25c   = draft.denomination === '0.25';
  const showMax01   = !isBase5c && !isBase25c;
  const showMax02   = isMultiDeno;
  const showMax05   = isBase5c || isMultiDeno;
  const showMax10   = isMultiDeno;

  const set = <K extends keyof Draft>(key: K, val: Draft[K]) =>
    setDraft(prev => prev ? { ...prev, [key]: val } : prev);

  const handleSave = () => {
    updateMachine(machine.id, applyDraft(machine, draft));
    onClose();
  };

  const bank = machine.location.split('-')[0];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={s.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={s.sheet}>
          <View style={s.handle} />

          {/* Header */}
          <View style={s.sheetHeader}>
            <View>
              <Text style={s.sheetTitle}>Máquina {machine.id}</Text>
              <Text style={s.sheetSubtitle}>{machine.location} · Banco {bank}</Text>
            </View>
            {!isAdmin && (
              <View style={s.viewerBadge}>
                <Text style={s.viewerBadgeText}>SOLO LECTURA</Text>
              </View>
            )}
          </View>

          <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Juego */}
            <FieldLabel>Juego</FieldLabel>
            <TextInput style={s.input} value={draft.game} onChangeText={v => set('game', v)} placeholderTextColor="#94a3b8" editable={isAdmin} />

            {/* Fabricante */}
            <FieldLabel>Fabricante</FieldLabel>
            <View style={s.chips}>
              {MANUFACTURERS.map(mfr => (
                <Pressable key={mfr} style={[s.chip, draft.manufacturer === mfr && s.chipActive]} onPress={() => isAdmin && set('manufacturer', mfr)}>
                  <Text style={[s.chipText, draft.manufacturer === mfr && s.chipTextActive]}>{mfr.replace('Light & Wonder', 'L&W')}</Text>
                </Pressable>
              ))}
            </View>

            {/* Tipo */}
            <FieldLabel>Tipo</FieldLabel>
            <View style={s.chips}>
              {TYPES.map(t => (
                <Pressable key={t} style={[s.chip, s.chipHalf, draft.type === t && s.chipActive]} onPress={() => isAdmin && set('type', t)}>
                  <Text style={[s.chipText, draft.type === t && s.chipTextActive]}>{t}</Text>
                </Pressable>
              ))}
            </View>

            {/* Denominación */}
            <FieldLabel>Denominación</FieldLabel>
            <View style={s.chips}>
              {DENOMS.map(d => (
                <Pressable key={d.value} style={[s.chip, s.chipHalf, draft.denomination === d.value && s.chipActive]} onPress={() => isAdmin && set('denomination', d.value)}>
                  <Text style={[s.chipText, draft.denomination === d.value && s.chipTextActive]}>{d.label}</Text>
                </Pressable>
              ))}
            </View>

            {/* Min Bet */}
            <FieldLabel>Apuesta Mínima ($)</FieldLabel>
            <TextInput style={s.input} value={draft.minBet} onChangeText={v => set('minBet', v)} keyboardType="decimal-pad" placeholder="0.75" placeholderTextColor="#94a3b8" editable={isAdmin} />

            {/* Max Bets */}
            {showMax01 && (<><FieldLabel>Max Bet @ 1¢ ($)</FieldLabel><TextInput style={s.input} value={draft.maxBet01} onChangeText={v => set('maxBet01', v)} keyboardType="decimal-pad" placeholder="7.50" placeholderTextColor="#94a3b8" editable={isAdmin} /></>)}
            {showMax02 && (<><FieldLabel>Max Bet @ 2¢ ($)</FieldLabel><TextInput style={s.input} value={draft.maxBet02} onChangeText={v => set('maxBet02', v)} keyboardType="decimal-pad" placeholder="15.00" placeholderTextColor="#94a3b8" editable={isAdmin} /></>)}
            {showMax05 && (<><FieldLabel>Max Bet @ 5¢ ($)</FieldLabel><TextInput style={s.input} value={draft.maxBet05} onChangeText={v => set('maxBet05', v)} keyboardType="decimal-pad" placeholder="37.50" placeholderTextColor="#94a3b8" editable={isAdmin} /></>)}
            {showMax10 && (<><FieldLabel>Max Bet @ 10¢ ($)</FieldLabel><TextInput style={s.input} value={draft.maxBet10} onChangeText={v => set('maxBet10', v)} keyboardType="decimal-pad" placeholder="75.00" placeholderTextColor="#94a3b8" editable={isAdmin} /></>)}

            {/* Avg Coin-In / Avg Win */}
            <View style={s.rowPair}>
              <View style={s.halfField}>
                <FieldLabel>Avg Coin-In ($)</FieldLabel>
                <TextInput style={s.input} value={draft.avgCoinIn} onChangeText={v => set('avgCoinIn', v)} keyboardType="decimal-pad" placeholder="3,500.00" placeholderTextColor="#94a3b8" editable={isAdmin} />
              </View>
              <View style={s.halfField}>
                <FieldLabel>Avg Win ($)</FieldLabel>
                <TextInput style={s.input} value={draft.avgWin} onChangeText={v => set('avgWin', v)} keyboardType="decimal-pad" placeholder="350.00" placeholderTextColor="#94a3b8" editable={isAdmin} />
              </View>
            </View>

            {/* Period label */}
            <FieldLabel>Etiqueta de Período</FieldLabel>
            <TextInput style={s.input} value={draft.period} onChangeText={v => set('period', v)} placeholder="ej. Q1 2025, Temporada Alta" placeholderTextColor="#94a3b8" editable={isAdmin} />

            {/* Period start / end */}
            <View style={s.rowPair}>
              <View style={s.halfField}>
                <FieldLabel>Fecha Inicio</FieldLabel>
                <TextInput style={s.input} value={draft.periodStart} onChangeText={v => set('periodStart', v)} placeholder="YYYY-MM-DD" placeholderTextColor="#94a3b8" editable={isAdmin} />
              </View>
              <View style={s.halfField}>
                <FieldLabel>Fecha Fin</FieldLabel>
                <TextInput style={s.input} value={draft.periodEnd} onChangeText={v => set('periodEnd', v)} placeholder="YYYY-MM-DD" placeholderTextColor="#94a3b8" editable={isAdmin} />
              </View>
            </View>

            {/* Active toggle */}
            <View style={s.toggleRow}>
              <Text style={s.toggleLabel}>Activa</Text>
              <Switch
                value={draft.active}
                onValueChange={v => { if (isAdmin) set('active', v); }}
                trackColor={{ false: BORDER, true: TEAL + 'AA' }}
                thumbColor={draft.active ? TEAL : '#94a3b8'}
                disabled={!isAdmin}
              />
            </View>

            <View style={{ height: 24 }} />
          </ScrollView>

          {/* Buttons */}
          <View style={s.btns}>
            <Pressable style={s.cancelBtn} onPress={onClose}>
              <Text style={s.cancelBtnText}>{isAdmin ? 'Cancelar' : 'Cerrar'}</Text>
            </Pressable>
            {isAdmin && (
              <Pressable style={s.saveBtn} onPress={handleSave}>
                <Text style={s.saveBtnText}>Guardar</Text>
              </Pressable>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <Text style={s.fieldLabel}>{String(children).toUpperCase()}</Text>;
}

const s = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.40)' },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    paddingBottom: 0,
    maxHeight: '92%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 20,
  },
  handle: {
    alignSelf: 'center', width: 40, height: 4,
    borderRadius: 2, backgroundColor: '#e2e8f0', marginBottom: spacing.md,
  },
  sheetHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: spacing.md,
  },
  sheetTitle:    { fontSize: 18, fontWeight: '700', color: NAVY },
  sheetSubtitle: { fontSize: 12, color: '#64748b', marginTop: 2 },
  viewerBadge: {
    backgroundColor: '#fef9c3', borderRadius: radius.pill,
    paddingHorizontal: spacing.sm, paddingVertical: 3,
    borderWidth: 1, borderColor: '#fde047',
  },
  viewerBadgeText: { fontSize: 10, fontWeight: '700', color: '#92400e', letterSpacing: 0.5 },
  scroll:     { marginTop: 4 },
  fieldLabel: {
    fontSize: 10, fontWeight: '700', color: '#94a3b8',
    letterSpacing: 0.8, marginTop: spacing.md, marginBottom: 6,
  },
  input: {
    backgroundColor: BG, borderRadius: radius.md,
    borderWidth: 1, borderColor: BORDER,
    paddingHorizontal: spacing.md, paddingVertical: 10,
    color: NAVY, fontSize: 15,
  },
  chips:        { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md, paddingVertical: 6,
    borderRadius: radius.pill, backgroundColor: '#f8f9fa',
    borderWidth: 1, borderColor: BORDER,
  },
  chipHalf:       { flex: 1, alignItems: 'center' },
  chipActive:     { backgroundColor: '#f0faf9', borderColor: 'rgba(42,157,143,0.50)' },
  chipText:       { fontSize: 12, fontWeight: '500', color: '#64748b' },
  chipTextActive: { color: TEAL, fontWeight: '700' },
  rowPair:        { flexDirection: 'row', gap: spacing.md },
  halfField:      { flex: 1 },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginTop: spacing.lg,
    paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: BORDER,
  },
  toggleLabel:    { fontSize: 15, fontWeight: '600', color: NAVY },
  btns:           { flexDirection: 'row', gap: spacing.md, paddingVertical: spacing.lg },
  cancelBtn: {
    flex: 1, padding: spacing.md, borderRadius: radius.md,
    backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: BORDER, alignItems: 'center',
  },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: '#64748b' },
  saveBtn: {
    flex: 2, padding: spacing.md, borderRadius: radius.md,
    backgroundColor: NAVY, alignItems: 'center',
  },
  saveBtnText:    { fontSize: 15, fontWeight: '600', color: '#ffffff' },
});
