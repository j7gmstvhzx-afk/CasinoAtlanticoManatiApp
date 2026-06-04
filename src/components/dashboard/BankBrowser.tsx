import React, { useState } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import { C, money } from './shared';
import { MachineRow } from './MachineRow';
import type { BankGroup } from '@/store/useSlotFloorStore';
import type { SlotMachine } from '@/types/domain';

type Props = {
  groups: BankGroup[];
  rankMetric: 'avgWin' | 'avgCoinIn';
  onEdit: (m: SlotMachine) => void;
};

type RankInfo = { label: string; color: string; border: string };

function rankInfo(rank: number, total: number): RankInfo | null {
  if (rank === 1) return { label: '🥇 #1', color: '#b8863f', border: '#f0d090' };
  if (rank <= 3)  return { label: `#${rank} Mejor`, color: '#b8863f', border: '#f0d090' };
  if (rank >= total - 2) return { label: `#${total - rank + 1} Peor`, color: '#c0392b', border: '#f5c6c6' };
  return null;
}

type CardProps = {
  group: BankGroup;
  rank: number;
  total: number;
  rankMetric: 'avgWin' | 'avgCoinIn';
  onEdit: (m: SlotMachine) => void;
};

function BankCard({ group, rank, total, rankMetric, onEdit }: CardProps) {
  const [expanded, setExpanded] = useState(false);
  const ri   = rankInfo(rank, total);
  const bank = group.bank.padStart(2, '0');
  const { width } = useWindowDimensions();
  const isWide = width >= 640;

  // Show total Coin-In PD and total Win PD for the whole bank
  const totalCILabel = isWide ? 'Total Coin-In PD del Banco' : 'Total CI PD';
  const totalWinLabel = isWide ? 'Total Win PD del Banco' : 'Total Win PD';

  return (
    <View style={[styles.card, ri && rank <= 3 && styles.cardTop]}>
      <Pressable style={styles.cardHeader} onPress={() => setExpanded(e => !e)} android_ripple={{ color: '#f0f0f0' }}>
        {/* Left: bank number badge */}
        <View style={[styles.bankBadge, rank <= 3 && styles.bankBadgeTop]}>
          <Text style={[styles.bankNum, rank <= 3 && styles.bankNumTop]}>Banco</Text>
          <Text style={[styles.bankNumLg, rank <= 3 && styles.bankNumTop]}>{bank}</Text>
          <Text style={styles.bankCount}>{group.machines.length} máqs</Text>
        </View>

        {/* Center: Total Coin-In PD + Total Win PD */}
        <View style={styles.metricsBlock}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{money(group.totalCoinIn, 0)}</Text>
            <Text style={styles.metricLabel}>{totalCILabel}</Text>
          </View>
          <View style={[styles.metricItem, styles.metricDivider]}>
            <Text style={[styles.metricValue, styles.metricValueWin]}>{money(group.totalWin, 0)}</Text>
            <Text style={styles.metricLabel}>{totalWinLabel}</Text>
          </View>
        </View>

        {/* Right: rank chip + avg per machine + chevron */}
        <View style={styles.rightCol}>
          {ri && (
            <View style={[styles.rankChip, { borderColor: ri.border }]}>
              <Text style={[styles.rankText, { color: ri.color }]}>{ri.label}</Text>
            </View>
          )}
          <Text style={styles.avgLabel}>CI: {money(group.avgCoinIn, 0)} · Win: {money(group.avgWin, 0)}</Text>
          <Text style={[styles.avgLabel, { color: '#b8863f' }]}>WWCJPR: {money(group.avgWin * 0.50, 0)} /máq</Text>
          <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={C.muted} />
        </View>
      </Pressable>

      {expanded && (
        <View style={styles.machineList}>
          <View style={styles.machineListHeader}>
            <Text style={styles.mlhText}>Posición · Juego · Fabricante</Text>
            <Text style={[styles.mlhText, { marginRight: 8 }]}>CI PD · Win PD · WWCJPR PD · Max Bet</Text>
          </View>
          {[...group.machines]
            .sort((a, b) => {
              const aPos = parseInt(a.location.split('-')[1] ?? '0', 10);
              const bPos = parseInt(b.location.split('-')[1] ?? '0', 10);
              return aPos - bPos;
            })
            .map(m => (
              <MachineRow key={m.id} machine={m} onEdit={onEdit} showBank />
            ))}
        </View>
      )}
    </View>
  );
}

export function BankBrowser({ groups, rankMetric, onEdit }: Props) {
  const sorted = [...groups].sort((a, b) =>
    rankMetric === 'avgWin' ? b.avgWin - a.avgWin : b.avgCoinIn - a.avgCoinIn
  );
  const rankMap = new Map(sorted.map((g, i) => [g.bank, i + 1]));

  return (
    <View style={{ gap: 12 }}>
      {groups.map(group => (
        <BankCard
          key={group.bank}
          group={group}
          rank={rankMap.get(group.bank) ?? 0}
          total={groups.length}
          rankMetric={rankMetric}
          onEdit={onEdit}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.card,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#1a2332',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTop: {
    borderColor: '#f0d090',
    shadowOpacity: 0.12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 14,
  },
  bankBadge: {
    width: 62,
    alignItems: 'center',
    backgroundColor: '#f3f6fa',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 6,
    gap: 1,
  },
  bankBadgeTop: {
    backgroundColor: '#fdf5e7',
  },
  bankNum: {
    fontSize: 9,
    fontWeight: '700',
    color: C.muted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  bankNumTop: {
    color: '#b8863f',
  },
  bankNumLg: {
    fontSize: 22,
    fontWeight: '900',
    color: C.navy,
    letterSpacing: -0.5,
  },
  bankCount: {
    fontSize: 10,
    color: C.muted,
    marginTop: 2,
  },
  metricsBlock: {
    flex: 1,
    flexDirection: 'row',
    gap: 0,
  },
  metricItem: {
    flex: 1,
    paddingHorizontal: 10,
  },
  metricDivider: {
    borderLeftWidth: 1,
    borderLeftColor: C.border,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
    color: C.navy,
    letterSpacing: -0.3,
  },
  metricValueWin: {
    color: C.green,
  },
  metricLabel: {
    fontSize: 10,
    color: C.muted,
    marginTop: 2,
    fontWeight: '500',
  },
  rightCol: {
    alignItems: 'flex-end',
    gap: 5,
    minWidth: 72,
  },
  rankChip: {
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderWidth: 1,
    backgroundColor: '#fffdf7',
  },
  rankText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  avgLabel: {
    fontSize: 10,
    color: C.muted,
    textAlign: 'right',
  },
  machineList: {
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  machineListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8fafc',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.border,
  },
  mlhText: {
    fontSize: 10,
    fontWeight: '700',
    color: C.muted,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});
