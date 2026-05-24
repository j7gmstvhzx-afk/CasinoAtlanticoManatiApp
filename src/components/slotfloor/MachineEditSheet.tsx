import React, { useState, useEffect } from 'react';
import {
  KeyboardAvoidingView, Modal, Platform, Pressable,
  ScrollView, StyleSheet, Switch, TextInput, View,
} from 'react-native';
import { Text } from '@/components/ui';
import { colors, spacing, radius } from '@/theme';
import { useSlotFloorStore } from '@/store/useSlotFloorStore';
import type { SlotMachine, SlotManufacturer, SlotMachineType } from '@/types/domain';

const TEAL = '#2a9d8f';

const MANUFACTURERS: SlotManufacturer[] = ['Light & Wonder', 'Aristocrat', 'IGT', 'Konami', 'Everi'];
const TYPES: SlotMachineType[]          = ['Easy Bet', 'Multi Line'];
const DENOMS = [
  { value: '0.01',       label: '1¢' },
  { value: '0.05',       label: '5¢' },
  { value: '0.25',       label: '25¢' },
  { value: '01/02/05/10', label: 'Multi' },
];

type Props = {
  machine:  SlotMachine | null;
  visible:  boolean;
  onClose:  () => void;
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
  };
}

export function MachineEditSheet({ machine, visible, onClose }: Props) {
  const updateMachine = useSlotFloorStore(s => s.updateMachine);
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

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text variant="h3" style={styles.title}>Editar Máquina {machine.id}</Text>
          <Text variant="caption" tone="muted">{machine.location}</Text>

          <ScrollView
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Game */}
            <FieldLabel>Juego</FieldLabel>
            <TextInput
              style={styles.input}
              value={draft.game}
              onChangeText={v => set('game', v)}
              placeholderTextColor={colors.text.muted}
            />

            {/* Manufacturer */}
            <FieldLabel>Fabricante</FieldLabel>
            <View style={styles.chips}>
              {MANUFACTURERS.map(mfr => (
                <Pressable
                  key={mfr}
                  style={[styles.chip, draft.manufacturer === mfr && styles.chipActive]}
                  onPress={() => set('manufacturer', mfr)}
                >
                  <Text variant="caption" style={draft.manufacturer === mfr ? { color: TEAL } : undefined}>
                    {mfr.replace('Light & Wonder', 'L&W')}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Type */}
            <FieldLabel>Tipo</FieldLabel>
            <View style={styles.chips}>
              {TYPES.map(t => (
                <Pressable
                  key={t}
                  style={[styles.chip, styles.chipHalf, draft.type === t && styles.chipActive]}
                  onPress={() => set('type', t)}
                >
                  <Text variant="small" style={draft.type === t ? { color: TEAL, fontWeight: '600' } : undefined}>
                    {t}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Denomination */}
            <FieldLabel>Denominación</FieldLabel>
            <View style={styles.chips}>
              {DENOMS.map(d => (
                <Pressable
                  key={d.value}
                  style={[styles.chip, styles.chipHalf, draft.denomination === d.value && styles.chipActive]}
                  onPress={() => set('denomination', d.value)}
                >
                  <Text variant="small" style={draft.denomination === d.value ? { color: TEAL, fontWeight: '600' } : undefined}>
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
              placeholderTextColor={colors.text.muted}
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
                  placeholderTextColor={colors.text.muted}
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
                  placeholderTextColor={colors.text.muted}
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
                  placeholderTextColor={colors.text.muted}
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
                  placeholderTextColor={colors.text.muted}
                />
              </>
            )}

            {/* Active toggle */}
            <View style={styles.toggleRow}>
              <Text variant="bodyStrong">Activa</Text>
              <Switch
                value={draft.active}
                onValueChange={v => set('active', v)}
                trackColor={{ false: colors.border.default, true: TEAL + 'AA' }}
                thumbColor={draft.active ? TEAL : colors.text.muted}
              />
            </View>

            <View style={{ height: 24 }} />
          </ScrollView>

          {/* Buttons */}
          <View style={styles.btns}>
            <Pressable style={styles.cancelBtn} onPress={onClose}>
              <Text variant="bodyStrong" tone="muted">Cancelar</Text>
            </Pressable>
            <Pressable style={styles.saveBtn} onPress={handleSave}>
              <Text variant="bodyStrong" style={{ color: colors.text.primary }}>Guardar</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text variant="caption" tone="muted" style={styles.fieldLabel}>
      {String(children).toUpperCase()}
    </Text>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  sheet: {
    backgroundColor: colors.bg.elevated,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    paddingBottom: 0,
    maxHeight: '90%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border.strong,
    marginBottom: spacing.md,
  },
  title:      { fontWeight: '700', marginBottom: 2 },
  scroll:     { marginTop: spacing.lg },
  fieldLabel: { marginTop: spacing.md, marginBottom: 6 },
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
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.default,
  },
  chipHalf: { flex: 1, alignItems: 'center' },
  chipActive: {
    backgroundColor: 'rgba(42,157,143,0.15)',
    borderColor: 'rgba(42,157,143,0.50)',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border.subtle,
  },
  btns: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
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
