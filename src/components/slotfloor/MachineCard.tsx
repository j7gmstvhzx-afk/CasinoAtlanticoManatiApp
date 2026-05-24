import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import { colors, spacing, radius } from '@/theme';
import type { SlotMachine } from '@/types/domain';

const TEAL = '#2a9d8f';
const GOLD = '#D4A24C';

type Props = {
  machine:       SlotMachine;
  onPress:       (m: SlotMachine) => void;
  onLongPress?:  (m: SlotMachine) => void;
  selected?:     boolean;
};

const TYPE_COLOR: Record<string, string> = {
  'Easy Bet':  GOLD,
  'Multi Line': TEAL,
};

export function MachineCard({ machine, onPress, onLongPress, selected }: Props) {
  const typeColor = TYPE_COLOR[machine.type] ?? colors.text.muted;

  return (
    <Pressable
      style={[styles.card, selected && styles.selected]}
      onPress={() => onPress(machine)}
      onLongPress={() => onLongPress?.(machine)}
      delayLongPress={400}
    >
      {/* Left: ID + location */}
      <View style={styles.left}>
        <Text variant="bodyStrong" style={{ fontWeight: '700' }}>{machine.id}</Text>
        <Text variant="caption" tone="muted">{machine.location}</Text>
        {!machine.active && (
          <View style={styles.inactiveBadge}>
            <Text variant="caption" style={{ color: colors.status.danger, fontSize: 10 }}>INACTIVA</Text>
          </View>
        )}
      </View>

      {/* Center: game + manufacturer */}
      <View style={styles.center}>
        <Text variant="small" style={{ fontWeight: '600' }} numberOfLines={1}>{machine.game}</Text>
        <Text variant="caption" tone="muted" numberOfLines={1}>{machine.manufacturer}</Text>
        <View style={styles.badges}>
          <View style={[styles.typeBadge, { borderColor: typeColor + '55' }]}>
            <Text variant="caption" style={{ color: typeColor, fontSize: 10 }}>{machine.type}</Text>
          </View>
          <Text variant="caption" tone="muted">{machine.denomination === '01/02/05/10' ? 'Multi' : machine.denomination.replace('0.', '')+'¢'}</Text>
        </View>
      </View>

      {/* Right: min bet + chevron */}
      <View style={styles.right}>
        <Text variant="small" style={{ color: GOLD, fontWeight: '600' }}>
          ${machine.minBet.toFixed(2)}
        </Text>
        <Text variant="caption" tone="muted">min bet</Text>
        <Ionicons name="chevron-forward" size={14} color={colors.text.muted} style={{ marginTop: 4 }} />
      </View>

      {/* Selection indicator */}
      {selected && (
        <View style={styles.checkmark}>
          <Ionicons name="checkmark-circle" size={22} color={TEAL} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.subtle,
  },
  selected: {
    backgroundColor: 'rgba(42,157,143,0.08)',
    borderColor: 'rgba(42,157,143,0.40)',
  },
  left: {
    width: 64,
    alignItems: 'flex-start',
    gap: 2,
  },
  center: {
    flex: 1,
    gap: 3,
  },
  right: {
    alignItems: 'flex-end',
    gap: 2,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  inactiveBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: radius.xs,
    backgroundColor: 'rgba(229,72,77,0.15)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(229,72,77,0.40)',
  },
  checkmark: {
    position: 'absolute',
    top: -6,
    right: -6,
  },
});
