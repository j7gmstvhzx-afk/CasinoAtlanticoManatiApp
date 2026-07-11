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

// Shows the editable bet range as one unit so changes to either bound are
// immediately visible in the same spot.
function BetRangeCol({ minBet, maxBet }: { minBet: number; maxBet: number | null }) {
  return (
    <View style={styles.metricCol}>
      <Text style={styles.metricLabel}>MIN / MAX BET</Text>
      <View style={styles.betRangeRow}>
        <Text style={[styles.metricValue, styles.betRangeValue, { color: C.navy3 }]}>{money(minBet, 2)}</Text>
        <Text style={styles.betRangeSep}>–</Text>
        <Text style={[styles.metricValue, styles.betRangeValue, { color: C.navy }]}>{maxBet != null ? money(maxBet, 2) : '—'}</Text>
      </View>
    </View>
  );
}

export function MachineRow({ machine: m, onEdit }: Props) {
  const mfrBg  = mfrColor(m.manufacturer, 0);
  // Multi-denomination machines have a separate max bet per denomination tier;
  // the true machine max is whichever tier's max is highest, not the first
  // tier that happens to be set.
  const hasMaxBet = m.maxBet01 != null || m.maxBet02 != null || m.maxBet05 != null || m.maxBet10 != null;
  const maxBet = hasMaxBet ? Math.max(m.maxBet01 ?? 0, m.maxBet02 ?? 0, m.maxBet05 ?? 0, m.maxBet10 ?? 0) : null;
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
        <BetRangeCol minBet={m.minBet} maxBet={maxBet} />
      </View>

      {/* Edit button */}
      {onEdit && (
        <Pressable
          style={styles.editBtn}
          onPress={() => onEdit(m)}
          hitSlop={8}
          hoverScale={1.12}
          scaleTo={0.9}
          accessibilityRole="button"
          accessibilityLabel={`Editar máquina ${m.id}`}
        >
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
  betRangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  betRangeValue: {
    fontSize: 11,
  },
  betRangeSep: {
    fontSize: 10,
    fontWeight: '700',
    color: C.faint,
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
