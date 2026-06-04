import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import { C, money, shortMfr, mfrColor } from './shared';
import type { SlotMachine } from '@/types/domain';

type Props = {
  machine: SlotMachine;
  onEdit?: (m: SlotMachine) => void;
  showBank?: boolean;
};

export function MachineRow({ machine: m, onEdit, showBank = false }: Props) {
  const mfrBg   = mfrColor(m.manufacturer, 0);
  const maxBet  = m.maxBet01 ?? m.maxBet05 ?? m.maxBet02 ?? m.maxBet10;

  return (
    <View style={styles.row}>
      {/* ID + location */}
      <View style={styles.idCol}>
        <Text style={styles.machineId}>{m.id}</Text>
        <Text style={styles.location}>{showBank ? m.location : m.location.split('-')[1]?.padStart(2, '0') ?? m.location}</Text>
      </View>

      {/* Game + manufacturer pill */}
      <View style={styles.gameCol}>
        <Text style={styles.game} numberOfLines={1}>{m.game}</Text>
        <View style={[styles.mfrPill, { backgroundColor: mfrBg + '22', borderColor: mfrBg + '55' }]}>
          <Text style={[styles.mfrText, { color: mfrBg }]}>{shortMfr(m.manufacturer)}</Text>
        </View>
      </View>

      {/* Metrics */}
      <View style={styles.metricsCol}>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Coin-In</Text>
          <Text style={styles.metricValue}>{money(m.avgCoinIn ?? 0, 0)}</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Win</Text>
          <Text style={[styles.metricValue, styles.winValue]}>{money(m.avgWin ?? 0, 0)}</Text>
        </View>
        {maxBet != null && (
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Max Bet</Text>
            <Text style={styles.metricValue}>{money(maxBet, 2)}</Text>
          </View>
        )}
      </View>

      {/* Edit button */}
      {onEdit && (
        <Pressable style={styles.editBtn} onPress={() => onEdit(m)} hitSlop={8}>
          <Ionicons name="pencil" size={14} color={C.navy} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e8ecf0',
    gap: 8,
    backgroundColor: C.card,
  },
  idCol: {
    width: 46,
  },
  machineId: {
    fontSize: 14,
    fontWeight: '700',
    color: C.navy,
  },
  location: {
    fontSize: 12,
    color: C.muted,
    marginTop: 1,
  },
  gameCol: {
    flex: 1,
    gap: 4,
  },
  game: {
    fontSize: 13,
    fontWeight: '600',
    color: C.text,
  },
  mfrPill: {
    alignSelf: 'flex-start',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
  },
  mfrText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  metricsCol: {
    gap: 2,
    alignItems: 'flex-end',
  },
  metricRow: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: C.muted,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '700',
    color: C.navy3,
    minWidth: 58,
    textAlign: 'right',
  },
  winValue: {
    color: C.green,
  },
  editBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#eef1f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
