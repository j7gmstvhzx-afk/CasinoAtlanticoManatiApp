import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui';
import { useSlotFloorStore } from '@/store/useSlotFloorStore';
import type { CoinInPeriod, SlotMachine } from '@/types/domain';
import { C, money, mfrColor, shortMfr, bankOf } from './shared';

type Props = {
  period: CoinInPeriod;
  onEditMachine: (m: SlotMachine) => void;
};

const TABS = ['Top 20 Máquinas', 'Ranking de Bancos', 'Análisis por Fabricante'] as const;

export function DetailTable({ period, onEditMachine }: Props) {
  const [tab, setTab] = useState(0);

  return (
    <View style={styles.card}>
      {/* Tab strip */}
      <View style={styles.tabStrip}>
        {TABS.map((t, i) => (
          <Pressable key={t} style={styles.tab} onPress={() => setTab(i)}>
            <Text style={[styles.tabText, tab === i && styles.tabTextActive]}>{t}</Text>
            {tab === i && <View style={styles.tabUnderline} />}
          </Pressable>
        ))}
      </View>

      {tab === 0 && <TopMachines period={period} onEditMachine={onEditMachine} />}
      {tab === 1 && <BankRanking period={period} />}
      {tab === 2 && <ByManufacturer period={period} />}
    </View>
  );
}

// ── Tab 0: Top 20 Machines ───────────────────────────────────────────────────
function TopMachines({ period, onEditMachine }: Props) {
  const getTop = useSlotFloorStore(s => s.getTopMachinesByCoinIn);
  const rows = getTop(period, 20);
  const days = periodDays(period);

  return (
    <>
      <View style={styles.sectionTitleRow}>
        <View style={styles.accent} />
        <Text style={styles.sectionTitle}>Top 20 Máquinas por Coin-In</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* header */}
          <View style={styles.headerRow}>
            <Text style={[styles.h, styles.cRank]}>RANK</Text>
            <Text style={[styles.h, styles.cLoc]}>LOCATION</Text>
            <Text style={[styles.h, styles.cBank]}>BANCO</Text>
            <Text style={[styles.h, styles.cGame]}>JUEGO</Text>
            <Text style={[styles.h, styles.cMfr]}>FABRICANTE</Text>
            <Text style={[styles.h, styles.cMoney]}>COIN-IN</Text>
            <Text style={[styles.h, styles.cMoney2]}>PROM/DÍA</Text>
          </View>

          {rows.length === 0 ? (
            <EmptyRow />
          ) : (
            rows.map(({ machine: m, total }, i) => (
              <Pressable
                key={m.id}
                style={({ pressed }) => [styles.bodyRow, pressed && styles.rowPressed]}
                onPress={() => onEditMachine(m)}
              >
                <View style={styles.cRank}>
                  <RankBadge rank={i + 1} />
                </View>
                <Text style={[styles.loc, styles.cLoc]}>{m.location}</Text>
                <Text style={[styles.bank, styles.cBank]}>{bankOf(m.location)}</Text>
                <Text style={[styles.game, styles.cGame]} numberOfLines={2}>{m.game}</Text>
                <View style={styles.cMfr}>
                  <MfrPill name={m.manufacturer} />
                </View>
                <Text style={[styles.moneyMain, styles.cMoney]}>{money(total)}</Text>
                <Text style={[styles.moneySub, styles.cMoney2]}>{money(days ? total / days : 0)}</Text>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </>
  );
}

// ── Tab 1: Bank Ranking ──────────────────────────────────────────────────────
function BankRanking({ period }: { period: CoinInPeriod }) {
  const getBankGroups = useSlotFloorStore(s => s.getBankGroups);
  const banks = getBankGroups(period).slice(0, 30);

  return (
    <>
      <View style={styles.sectionTitleRow}>
        <View style={styles.accent} />
        <Text style={styles.sectionTitle}>Ranking de Bancos por Coin-In</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View style={styles.headerRow}>
            <Text style={[styles.h, styles.cRank]}>RANK</Text>
            <Text style={[styles.h, styles.cBankWide]}>BANCO</Text>
            <Text style={[styles.h, styles.cCount]}>MÁQS.</Text>
            <Text style={[styles.h, styles.cGameWide]}>TOP JUEGO</Text>
            <Text style={[styles.h, styles.cMoney]}>COIN-IN</Text>
          </View>

          {banks.length === 0 ? (
            <EmptyRow />
          ) : (
            banks.map((b, i) => (
              <View key={b.bank} style={styles.bodyRow}>
                <View style={styles.cRank}><RankBadge rank={i + 1} /></View>
                <Text style={[styles.bankName, styles.cBankWide]}>Banco {b.bank}</Text>
                <Text style={[styles.count, styles.cCount]}>{b.machines.length}</Text>
                <Text style={[styles.game, styles.cGameWide]} numberOfLines={1}>{b.topGame || '—'}</Text>
                <Text style={[styles.moneyMain, styles.cMoney]}>{money(b.totalCoinIn)}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </>
  );
}

// ── Tab 2: By Manufacturer ───────────────────────────────────────────────────
function ByManufacturer({ period }: { period: CoinInPeriod }) {
  const machines = useSlotFloorStore(s => s.machines);
  const coinIn   = useSlotFloorStore(s => s.coinIn);

  // count + coin-in per manufacturer (single pass over coinIn within the window)
  const countByMfr = new Map<string, number>();
  const coinByMfr  = new Map<string, number>();
  const idToMfr    = new Map(machines.map(m => [m.id, m.manufacturer]));
  for (const m of machines) countByMfr.set(m.manufacturer, (countByMfr.get(m.manufacturer) ?? 0) + 1);

  const { from, to } = windowFor(period);
  for (const e of coinIn) {
    if (e.date < from || e.date > to) continue;
    const mfr = idToMfr.get(e.machineId);
    if (!mfr) continue;
    coinByMfr.set(mfr, (coinByMfr.get(mfr) ?? 0) + e.amount);
  }

  const rows = Array.from(countByMfr.keys())
    .map((name, idx) => ({
      name,
      count: countByMfr.get(name) ?? 0,
      coin:  coinByMfr.get(name) ?? 0,
      color: mfrColor(name, idx),
    }))
    .sort((a, b) => b.coin - a.coin);

  return (
    <>
      <View style={styles.sectionTitleRow}>
        <View style={styles.accent} />
        <Text style={styles.sectionTitle}>Análisis por Fabricante</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View style={styles.headerRow}>
            <Text style={[styles.h, styles.cMfrWide]}>FABRICANTE</Text>
            <Text style={[styles.h, styles.cCount]}>MÁQS.</Text>
            <Text style={[styles.h, styles.cMoney]}>COIN-IN</Text>
            <Text style={[styles.h, styles.cMoney2]}>PROM/MÁQ.</Text>
          </View>

          {rows.length === 0 ? (
            <EmptyRow />
          ) : (
            rows.map(r => (
              <View key={r.name} style={styles.bodyRow}>
                <View style={[styles.cMfrWide, styles.mfrCell]}>
                  <View style={[styles.mfrSwatch, { backgroundColor: r.color }]} />
                  <Text style={styles.mfrName} numberOfLines={1}>{r.name}</Text>
                </View>
                <Text style={[styles.count, styles.cCount]}>{r.count}</Text>
                <Text style={[styles.moneyMain, styles.cMoney]}>{money(r.coin)}</Text>
                <Text style={[styles.moneySub, styles.cMoney2]}>{money(r.count ? r.coin / r.count : 0)}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </>
  );
}

// ── helpers ──────────────────────────────────────────────────────────────────
function windowFor(period: CoinInPeriod): { from: string; to: string } {
  const today = new Date();
  const to = iso(today);
  const d = new Date(today);
  switch (period) {
    case 'mtd':        d.setDate(1); break;
    case 'quarterly':  d.setMonth(Math.floor(d.getMonth() / 3) * 3, 1); break;
    case 'semiannual': d.setMonth(d.getMonth() - 6); break;
    case 'annual':     d.setFullYear(d.getFullYear() - 1); break;
    case 'ytd':
    default:           d.setMonth(0, 1); break;
  }
  return { from: iso(d), to };
}
function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function periodDays(period: CoinInPeriod): number {
  const { from, to } = windowFor(period);
  const ms = new Date(to).getTime() - new Date(from).getTime();
  return Math.max(Math.round(ms / 86400000), 1);
}

function RankBadge({ rank }: { rank: number }) {
  const top3 = rank <= 3;
  return (
    <View style={[styles.rankBadge, { backgroundColor: top3 ? C.navy : C.gold }]}>
      <Text style={styles.rankText}>{rank}</Text>
    </View>
  );
}

function MfrPill({ name }: { name: string }) {
  return (
    <View style={styles.mfrPill}>
      <Text style={styles.mfrPillText} numberOfLines={2}>{shortMfr(name)}</Text>
    </View>
  );
}

function EmptyRow() {
  return (
    <View style={styles.emptyRow}>
      <Text style={styles.emptyText}>Sin datos para este período</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#1a2332',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 2,
  },
  // tab strip
  tabStrip: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    marginBottom: 18,
    gap: 4,
  },
  tab: { paddingVertical: 10, paddingHorizontal: 4, marginRight: 18 },
  tabText: { fontSize: 14, fontWeight: '600', color: C.muted },
  tabTextActive: { color: C.ink, fontWeight: '700' },
  tabUnderline: {
    position: 'absolute', left: 0, right: 18, bottom: -1, height: 2.5,
    backgroundColor: C.gold, borderRadius: 2,
  },

  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  accent: { width: 4, height: 18, borderRadius: 2, backgroundColor: C.gold },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: C.ink, letterSpacing: -0.2 },

  // table header (dark navy)
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.navy,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 6,
  },
  h: { fontSize: 11, fontWeight: '700', color: '#ffffff', letterSpacing: 0.5 },

  bodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: C.rowLine,
  },
  rowPressed: { backgroundColor: '#f7f9fb' },

  // columns
  cRank:     { width: 56, alignItems: 'flex-start' },
  cLoc:      { width: 84 },
  cBank:     { width: 60 },
  cGame:     { width: 130, paddingRight: 8 },
  cGameWide: { width: 200, paddingRight: 8 },
  cMfr:      { width: 110 },
  cMfrWide:  { width: 180 },
  cMoney:    { width: 96, textAlign: 'right' },
  cMoney2:   { width: 92, textAlign: 'right' },
  cBankWide: { width: 110 },
  cCount:    { width: 64, textAlign: 'center' },

  loc:   { fontSize: 13, color: C.text },
  bank:  { fontSize: 13, color: C.text },
  game:  { fontSize: 13, color: C.text, lineHeight: 17 },
  count: { fontSize: 14, fontWeight: '700', color: C.navy3, textAlign: 'center' },
  bankName: { fontSize: 14, fontWeight: '700', color: C.ink },

  moneyMain: { fontSize: 14, fontWeight: '800', color: C.ink, textAlign: 'right' },
  moneySub:  { fontSize: 13, fontWeight: '600', color: C.faint, textAlign: 'right' },

  rankBadge: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  rankText:  { fontSize: 13, fontWeight: '800', color: '#ffffff' },

  mfrPill: {
    alignSelf: 'flex-start',
    backgroundColor: C.navy,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    maxWidth: 104,
  },
  mfrPillText: { fontSize: 11, fontWeight: '700', color: '#ffffff' },

  mfrCell: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mfrSwatch: { width: 12, height: 12, borderRadius: 4 },
  mfrName: { fontSize: 14, fontWeight: '600', color: C.ink },

  emptyRow: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { fontSize: 14, color: C.faint },
});
