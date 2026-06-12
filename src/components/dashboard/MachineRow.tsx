import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import { C, money, shortMfr, mfrColor } from './shared';
import { AnimatedPressable as Pressable } from './AnimatedPressable';
import type { SlotMachine } from '@/types/domain';

type Props = {
  machine: SlotMachine;
  onEdit?: (m: SlotMachine) => void;
};

function MetricCol({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.metricCol}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
    </View>
  );
}

export function MachineRow({ machine: m, onEdit }: Props) {
  const mfrBg  = mfrColor(m.manufacturer, 0);
  const maxBet = m.maxBet01 ?? m.maxBet05 ?? m.maxBet02 ?? m.maxBet10;
  // WWCJPR = Win Without Comisión de Juegos de PR (Avg Win after deducting 50% CJPR fee)
  const wwcjpr = m.avgWin != null ? m.avgWin * 0.50 : null;

  return (
    <View style={styles.row}>

      {/* Manufacturer accent bar */}
      <View style={[styles.accentBar, { backgroundColor: mfrBg }]} />

      {/* Machine ID + location */}
      <View style={styles.idCol}>
        <Text style={styles.machineId}>{m.id}</Text>
        <Text style={styles.location}>{m.location}</Text>
      </View>

      {/* Game name + manufacturer pill */}
      <View style={styles.gameCol}>
        <Text style={styles.game} numberOfLines={2}>{m.game}</Text>
        <View style={[styles.mfrPill, { backgroundColor: mfrBg + '15', borderColor: mfrBg + '45' }]}>
          <Text style={[styles.mfrText, { color: mfrBg }]}>{shortMfr(m.manufacturer)}</Text>
        </View>
      </View>

      {/* Grouped metrics panel */}
      <View style={styles.metricsPanel}>
        <MetricCol label="CI PD"    value={money(m.avgCoinIn ?? 0, 0)} color={C.navy3}   />
        <View style={styles.divider} />
        <MetricCol label="WIN PD"   value={money(m.avgWin ?? 0, 0)}    color={C.green}   />
        <View style={styles.divider} />
        {wwcjpr != null
          ? <MetricCol label="WWCJPR" value={money(wwcjpr, 0)} color="#b8863f" />
          : <View style={styles.metricEmpty} />}
        <View style={styles.divider} />
        {maxBet != null
          ? <MetricCol label="MAX BET" value={money(maxBet, 2)} color={C.navy} />
          : <View style={styles.metricEmpty} />}
      </View>

      {/* Edit button */}
      {onEdit && (
        <Pressable style={styles.editBtn} onPress={() => onEdit(m)} hitSlop={8} hoverScale={1.12} scaleTo={0.9}>
          <Ionicons name="pencil" size={13} color={C.navy3} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.border,
    minHeight: 46,
    overflow: 'hidden',
  },

  accentBar: {
    width: 3,
    alignSelf: 'stretch',
  },

  idCol: {
    width: 50,
    paddingVertical: 6,
    paddingLeft: 8,
    gap: 1,
  },
  machineId: {
    fontSize: 13,
    fontWeight: '800',
    color: C.navy,
    letterSpacing: -0.3,
  },
  location: {
    fontSize: 9,
    fontWeight: '700',
    color: C.gold,
    letterSpacing: 0.3,
  },

  gameCol: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    gap: 3,
  },
  game: {
    fontSize: 12,
    fontWeight: '600',
    color: C.text,
    lineHeight: 15,
  },
  mfrPill: {
    alignSelf: 'flex-start',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderWidth: 1,
  },
  mfrText: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // Metrics panel — all 4 metrics in one grouped background strip
  metricsPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.track,
    borderRadius: 8,
    marginVertical: 5,
    marginRight: 6,
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.border,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    height: 22,
    backgroundColor: '#d0d8e4',
    marginHorizontal: 2,
  },
  metricCol: {
    alignItems: 'center',
    paddingHorizontal: 8,
    minWidth: 60,
  },
  metricEmpty: {
    minWidth: 60,
    paddingHorizontal: 8,
  },
  metricLabel: {
    fontSize: 7.5,
    fontWeight: '700',
    color: C.muted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: -0.3,
  },

  editBtn: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: '#eef1f5',
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
});
