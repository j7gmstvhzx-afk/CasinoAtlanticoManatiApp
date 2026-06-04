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
  const mfrBg  = mfrColor(m.manufacturer, 0);
  const maxBet = m.maxBet01 ?? m.maxBet05 ?? m.maxBet02 ?? m.maxBet10;
  // WWCJPR = Win Without Comisión de Juegos de Puerto Rico (Win después de deducir 50% CJPR)
  const wwcjpr = m.avgWin != null ? m.avgWin * 0.50 : null;

  return (
    <View style={styles.row}>

      {/* ID + location */}
      <View style={styles.idCol}>
        <Text style={styles.machineId}>{m.id}</Text>
        <Text style={styles.location}>{m.location}</Text>
      </View>

      {/* Game name + manufacturer pill */}
      <View style={styles.gameCol}>
        <Text style={styles.game} numberOfLines={2}>{m.game}</Text>
        <View style={[styles.mfrPill, { backgroundColor: mfrBg + '18', borderColor: mfrBg + '55' }]}>
          <Text style={[styles.mfrText, { color: mfrBg }]}>{shortMfr(m.manufacturer)}</Text>
        </View>
      </View>

      {/* Compact 2×2 metric grid */}
      <View style={styles.metricsGrid}>
        {/* Row 1: Coin-In + Win */}
        <View style={styles.metricPair}>
          <View style={styles.metricCell}>
            <Text style={styles.metricTag}>Avg CI PD</Text>
            <Text style={styles.metricValue}>{money(m.avgCoinIn ?? 0, 0)}</Text>
          </View>
          <View style={styles.metricCell}>
            <Text style={styles.metricTag}>Avg Win PD</Text>
            <Text style={[styles.metricValue, { color: C.green }]}>{money(m.avgWin ?? 0, 0)}</Text>
          </View>
        </View>
        {/* Row 2: WWCJPR + Max Bet */}
        <View style={styles.metricPair}>
          {wwcjpr != null ? (
            <View style={styles.metricCell}>
              <Text style={styles.metricTag}>WWCJPR PD</Text>
              <Text style={[styles.metricValue, { color: C.gold }]}>{money(wwcjpr, 0)}</Text>
            </View>
          ) : <View style={styles.metricCell} />}
          {maxBet != null ? (
            <View style={styles.metricCell}>
              <Text style={styles.metricTag}>Max Bet</Text>
              <Text style={[styles.metricValue, { color: C.navy3 }]}>{money(maxBet, 2)}</Text>
            </View>
          ) : <View style={styles.metricCell} />}
        </View>
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
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.border,
    gap: 10,
    backgroundColor: C.card,
  },
  idCol: {
    width: 50,
    gap: 2,
  },
  machineId: {
    fontSize: 14,
    fontWeight: '800',
    color: C.navy,
    letterSpacing: -0.2,
  },
  location: {
    fontSize: 11,
    color: C.gold,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  gameCol: {
    flex: 1,
    gap: 5,
  },
  game: {
    fontSize: 13,
    fontWeight: '600',
    color: C.text,
    lineHeight: 17,
  },
  mfrPill: {
    alignSelf: 'flex-start',
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
  },
  mfrText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // 2×2 compact metric grid
  metricsGrid: {
    gap: 6,
    alignItems: 'flex-end',
  },
  metricPair: {
    flexDirection: 'row',
    gap: 14,
  },
  metricCell: {
    alignItems: 'flex-end',
    minWidth: 68,
  },
  metricTag: {
    fontSize: 9,
    fontWeight: '700',
    color: C.muted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '800',
    color: C.navy3,
    letterSpacing: -0.2,
  },

  editBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#eef1f5',
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
