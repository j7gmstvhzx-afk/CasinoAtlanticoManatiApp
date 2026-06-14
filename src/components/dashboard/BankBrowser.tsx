import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Text } from '@/components/ui';
import { C, money } from './shared';
import { AnimatedPressable as Pressable } from './AnimatedPressable';
import { AnimatedChevron } from './AnimatedChevron';
import { MachineRow } from './MachineRow';
import type { BankGroup } from '@/store/useSlotFloorStore';
import type { SlotMachine } from '@/types/domain';

type Props = {
  groups: BankGroup[];
  rankMetric: 'avgWin' | 'avgCoinIn';
  onEdit: (m: SlotMachine) => void;
  // Drill-down target (e.g. from the floor heatmap): auto-expands that bank.
  focusBank?: string | null;
  // Reports each card's y-offset so the parent ScrollView can jump to it.
  onBankLayout?: (bank: string, y: number) => void;
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
  focused?: boolean;
  onLayoutY?: (y: number) => void;
};

function BankCard({ group, rank, total, rankMetric, onEdit, focused, onLayoutY }: CardProps) {
  const [expanded, setExpanded] = useState(false);
  const ri   = rankInfo(rank, total);
  const bank = group.bank.padStart(2, '0');
  const { width } = useWindowDimensions();
  const isWide = width >= 640;

  useEffect(() => {
    if (focused) setExpanded(true);
  }, [focused]);

  // Headline metrics: Avg Coin-In / Avg Win PER MACHINE — what actually ranks the bank
  const avgCILabel  = isWide ? 'Avg Coin-In PD del Banco' : 'Avg CI PD/máq';
  const avgWinLabel = isWide ? 'Avg Win PD del Banco' : 'Avg Win PD/máq';

  return (
    <View
      style={[styles.card, ri && rank <= 3 && styles.cardTop, focused && styles.cardFocused]}
      onLayout={onLayoutY ? e => onLayoutY(e.nativeEvent.layout.y) : undefined}
    >
      <Pressable
        style={styles.cardHeader}
        onPress={() => setExpanded(e => !e)}
        android_ripple={{ color: '#f0f0f0' }}
        scaleTo={0.995}
      >
        {/* Left: bank number badge */}
        <View style={[styles.bankBadge, rank <= 3 && styles.bankBadgeTop]}>
          <Text style={[styles.bankNum, rank <= 3 && styles.bankNumTop]}>Banco</Text>
          <Text style={[styles.bankNumLg, rank <= 3 && styles.bankNumTop]}>{bank}</Text>
          <Text style={styles.bankCount}>{group.machines.length} máqs</Text>
        </View>

        {/* Center: Avg Coin-In PD + Avg Win PD (per machine — the ranking metrics) */}
        <View style={styles.metricsBlock}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{money(group.avgCoinIn, 0)}</Text>
            <Text style={styles.metricLabel}>{avgCILabel}</Text>
          </View>
          <View style={[styles.metricItem, styles.metricDivider]}>
            <Text style={[styles.metricValue, styles.metricValueWin]}>{money(group.avgWin, 0)}</Text>
            <Text style={styles.metricLabel}>{avgWinLabel}</Text>
          </View>
        </View>

        {/* Right: rank chip + bank totals + WWCJPR + chevron */}
        <View style={[styles.rightCol, !isWide && styles.rightColNarrow]}>
          {ri && (
            <View style={[styles.rankChip, { borderColor: ri.border }]}>
              <Text style={[styles.rankText, { color: ri.color }]}>{ri.label}</Text>
            </View>
          )}
          <Text style={styles.avgLabel}>Total CI: {money(group.totalCoinIn, 0)} · Win: {money(group.totalWin, 0)}</Text>
          <Text style={[styles.avgLabel, { color: '#b8863f' }]}>WWCJPR: {money(group.avgWin * 0.50, 0)} /máq</Text>
          <AnimatedChevron expanded={expanded} size={16} color={C.muted} />
        </View>
      </Pressable>

      {expanded && (
        <Animated.View entering={FadeIn.duration(160)} style={styles.machineList}>
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
              <MachineRow key={m.id} machine={m} onEdit={onEdit} />
            ))}
        </Animated.View>
      )}
    </View>
  );
}

export function BankBrowser({ groups, rankMetric, onEdit, focusBank, onBankLayout }: Props) {
  const rankMap = useMemo(() => {
    const sorted = [...groups].sort((a, b) =>
      rankMetric === 'avgWin' ? b.avgWin - a.avgWin : b.avgCoinIn - a.avgCoinIn
    );
    return new Map(sorted.map((g, i) => [g.bank, i + 1]));
  }, [groups, rankMetric]);

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
          focused={focusBank === group.bank}
          onLayoutY={onBankLayout ? y => onBankLayout(group.bank, y) : undefined}
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
  cardFocused: {
    borderColor: C.navy,
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    flexWrap: 'wrap',
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
  rightColNarrow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.border,
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
