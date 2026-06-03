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

const NAVY = '#1a2332';
const GOLD = '#d4a574';
const TEAL = '#2a9d8f';
const BORDER = '#e2e8f0';
const BG = '#f8f9fa';

const MANUFACTURERS: SlotManufacturer[] = ['Light & Wonder', 'Aristocrat', 'IGT', 'Konami', 'Everi'];
const TYPES: SlotMachineType[]          = ['Easy Bet', 'Multi Line'];
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
  active:       boolean;
  period:       string;
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
    active:       m.active,
    period:       m.period ?? '',
  };
}

function applyDraft(m: SlotMachine, d: Draft): Partial<SlotMachine> {
  const isMulti = d.denomination === '01/02/05/10';
  const is5c    = d.denomination === '0.05';
  return {
    game:         d.game.trim() || m.game,
    manufacturer: d.manufacturer,
    type:         d.type,
    minBet:       parseFloat(d.minBet)  || m.minBet,
    denomination: d.denomination,
    multiDeno:    isMulti,
    maxBet01: !is5c && d.denomination !== '0.25'   ? (parseFloat(d.maxBet01) || null) : null,
    maxBet02: isMulti                              ? (parseFloat(d.maxBet02) || null) : null,
    maxBet05: (is5c || isMulti)                    ? (parseFloat(d.maxBet05) || null) : null,
    maxBet10: isMulti                              ? (parseFloat(d.maxBet10) || null) : null,
    active:       d.active,
    period:       d.period.trim() === '' ? null : d.period.trim(),
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
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>Máquina {machine.id}</Text>
              <Text style={styles.sheetSubtitle}>{machine.location} · Banco {bank}</Text>
            </View>
            {!isAdmin && (
              <View style={styles.viewerBadge}>
                <Text style={styles.viewerBadgeText}>SOLO LECTURA</Text>
              </View>
            )}
          </View>

          <ScrollView
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Juego */}
            <FieldLabel>Juego</FieldLabel>
            <TextInput
              style={styles.input}
              value={draft.game}
              onChangeText={v => set('game', v)}
              placeholderTextColor="#94a3b8"
              editable={isAdmin}
            />

            {/* Fabricante */}
            <FieldLabel>Fabricante</FieldLabel>
            <View style={styles.chips}>
              {MANUFACTURERS.map(mfr => (
                <Pressable
                  key={mfr}
                  style={[styles.chip, draft.manufacturer === mfr && styles.chipActive]}
                  onPress={() => isAdmin && set('manufacturer', mfr)}
                >
                  <Text style={[styles.chipText, draft.manufacturer === mfr && styles.chipTextActive]}>
                    {mfr.replace('Light & Wonder', 'L&W')}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Tipo */}
            <FieldLabel>Tipo</FieldLabel>
            <View style={styles.chips}>
              {TYPES.map(t => (
                <Pressable
                  key={t}
                  style={[styles.chip, styles.chipHalf, draft.type === t && styles.chipActive]}
                  onPress={() => isAdmin && set('type', t)}
                >
                  <Text style={[styles.chipText, draft.type === t && styles.chipTextActive]}>{t}</Text>
                </Pressable>
              ))}
            </View>

            {/* Denominación */}
            <FieldLabel>Denominación</FieldLabel>
            <View style={styles.chips}>
              {DENOMS.map(d => (
                <Pressable
                  key={d.value}
                  style={[styles.chip, styles.chipHalf, draft.denomination === d.value && styles.chipActive]}
                  onPress={() => isAdmin && set('denomination', d.value)}
                >
                  <Text style={[styles.chipText, draft.denomination === d.value && styles.chipTextActive]}>
                    {d.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Min Bet */}
            <FieldLabel>Apuesta Mínima ($)</FieldLabel>
            <TextInput
              style={styles.input}
              value={draft.minBet}
              onChangeText={v => set('minBet', v)}
              keyboardType="decimal-pad"
              placeholder="0.75"
              placeholderTextColor="#94a3b8"
              editable={isAdmin}
            />

            {/* Max bets (conditional) */}
            {showMax01 && (
              <>
                <FieldLabel>Max Bet @ 1¢ ($)</FieldLabel>
                <TextInput
                  style={styles.input}
                  value={draft.maxBet01}
                  onChangeText={v => set('maxBet01', v)}
                  keyboardType="decimal-pad"
                  placeholder="7.50"
                  placeholderTextColor="#94a3b8"
                  editable={isAdmin}
                />
              </>
            )}
            {showMax02 && (
              <>
                <FieldLabel>Max Bet @ 2¢ ($)</FieldLabel>
                <TextInput
                  style={styles.input}
                  value={draft.maxBet02}
                  onChangeText={v => set('maxBet02', v)}
                  keyboardType="decimal-pad"
                  placeholder="15.00"
                  placeholderTextColor="#94a3b8"
                  editable={isAdmin}
                />
              </>
            )}
            {showMax05 && (
              <>
                <FieldLabel>Max Bet @ 5¢ ($)</FieldLabel>
                <TextInput
                  style={styles.input}
                  value={draft.maxBet05}
                  onChangeText={v => set('maxBet05', v)}
                  keyboardType="decimal-pad"
                  placeholder="37.50"
                  placeholderTextColor="#94a3b8"
                  editable={isAdmin}
                />
              </>
            )}
            {showMax10 && (
              <>
                <FieldLabel>Max Bet @ 10¢ ($)</FieldLabel>
                <TextInput
                  style={styles.input}
                  value={draft.maxBet10}
                  onChangeText={v => set('maxBet10', v)}
                  keyboardType="decimal-pad"
                  placeholder="75.00"
                  placeholderTextColor="#94a3b8"
                  editable={isAdmin}
                />
              </>
            )}

            {/* Período */}
            <FieldLabel>Período Operativo</FieldLabel>
            <TextInput
              style={styles.input}
              value={draft.period}
              onChangeText={v => set('period', v)}
              placeholder="ej. Q1 2025, Temporada Alta"
              placeholderTextColor="#94a3b8"
              editable={isAdmin}
            />

            {/* Active toggle */}
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Activa</Text>
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
          <View style={styles.btns}>
            <Pressable style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>{isAdmin ? 'Cancelar' : 'Cerrar'}</Text>
            </Pressable>
            {isAdmin && (
              <Pressable style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Guardar</Text>
              </Pressable>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text style={styles.fieldLabel}>{String(children).toUpperCase()}</Text>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.40)',
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    paddingBottom: 0,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 20,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e2e8f0',
    marginBottom: spacing.md,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: NAVY,
  },
  sheetSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  viewerBadge: {
    backgroundColor: '#fef9c3',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#fde047',
  },
  viewerBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#92400e',
    letterSpacing: 0.5,
  },
  scroll:     { marginTop: 4 },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.8,
    marginTop: spacing.md,
    marginBottom: 6,
  },
  input: {
    backgroundColor: BG,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: NAVY,
    fontSize: 15,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: BORDER,
  },
  chipHalf:       { flex: 1, alignItems: 'center' },
  chipActive:     { backgroundColor: '#f0faf9', borderColor: 'rgba(42,157,143,0.50)' },
  chipText:       { fontSize: 12, fontWeight: '500', color: '#64748b' },
  chipTextActive: { color: TEAL, fontWeight: '700' },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  toggleLabel: { fontSize: 15, fontWeight: '600', color: NAVY },
  btns: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  cancelBtn: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
  },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: '#64748b' },
  saveBtn: {
    flex: 2,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: NAVY,
    alignItems: 'center',
  },
  saveBtnText: { fontSize: 15, fontWeight: '600', color: '#ffffff' },
});
