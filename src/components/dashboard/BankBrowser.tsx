import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import { C, card, money } from './shared';
import { MachineRow } from './MachineRow';
import type { BankGroup } from '@/store/useSlotFloorStore';
import type { SlotMachine } from '@/types/domain';

type Props = {
  groups: BankGroup[];
  rankMetric: 'avgWin' | 'avgCoinIn';
  onEdit: (m: SlotMachine) => void;
};

type RankInfo = { label: string; color: string; bg: string };

function rankInfo(rank: number, total: number): RankInfo | null {
  if (rank <= 3)       return { label: `#${rank} Mejor`,  color: C.gold,  bg: '#f6ecdd' };
  if (rank >= total - 2) return { label: `#${total - rank + 1} Peor`, color: '#e53e3e', bg: '#fff5f5' };
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

  return (
    <View style={styles.card}>
      <Pressable style={styles.cardHeader} onPress={() => setExpanded(e => !e)}>
        {/* Left: bank + count */}
        <View style={styles.bankLabel}>
          <Text style={styles.bankNum}>Banco {bank}</Text>
          <Text style={styles.bankCount}>{group.machines.length} máqs</Text>
        </View>

        {/* Center: metrics */}
        <View style={styles.metrics}>
          <Text style={styles.metricPrimary}>{money(group.avgCoinIn, 0)}</Text>
          <Text style={styles.metricSub}>Coin-In prom.</Text>
          <Text style={styles.metricWin}>{money(group.avgWin, 0)}</Text>
          <Text style={styles.metricSub}>Win prom.</Text>
        </View>

        {/* Right: rank chip + chevron */}
        <View style={styles.rightCol}>
          {ri && (
            <View style={[styles.rankChip, { backgroundColor: ri.bg }]}>
              <Text style={[styles.rankText, { color: ri.color }]}>{ri.label}</Text>
            </View>
          )}
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={C.muted}
          />
        </View>
      </Pressable>

      {expanded && (
        <View style={styles.machineList}>
          {group.machines
            .sort((a, b) => {
              const aVal = rankMetric === 'avgWin' ? (a.avgWin ?? 0) : (a.avgCoinIn ?? 0);
              const bVal = rankMetric === 'avgWin' ? (b.avgWin ?? 0) : (b.avgCoinIn ?? 0);
              return bVal - aVal;
            })
            .map(m => (
              <MachineRow key={m.id} machine={m} onEdit={onEdit} />
            ))}
        </View>
      )}
    </View>
  );
}

export function BankBrowser({ groups, rankMetric, onEdit }: Props) {
  const sorted = [...groups].sort((a, b) =>
    rankMetric === 'avgWin'
      ? b.avgWin    - a.avgWin
      : b.avgCoinIn - a.avgCoinIn
  );

  // Map bank → rank by selected metric
  const rankMap = new Map(sorted.map((g, i) => [g.bank, i + 1]));

  // Display order is always 09→52
  return (
    <View style={{ gap: 10 }}>
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
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#1a2332',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  bankLabel: {
    width: 72,
  },
  bankNum: {
    fontSize: 14,
    fontWeight: '800',
    color: C.navy,
  },
  bankCount: {
    fontSize: 11,
    color: C.muted,
    marginTop: 1,
  },
  metrics: {
    flex: 1,
  },
  metricPrimary: {
    fontSize: 15,
    fontWeight: '700',
    color: C.navy3,
  },
  metricSub: {
    fontSize: 10,
    color: C.muted,
    marginBottom: 2,
  },
  metricWin: {
    fontSize: 13,
    fontWeight: '700',
    color: C.green,
  },
  rightCol: {
    alignItems: 'flex-end',
    gap: 6,
  },
  rankChip: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  rankText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  machineList: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e8ecf0',
  },
});
