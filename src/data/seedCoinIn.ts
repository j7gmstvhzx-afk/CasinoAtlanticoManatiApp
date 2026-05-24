import type { SlotMachine, CoinInEntry } from '@/types/domain';

function hashNum(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function baseDailyAmount(m: SlotMachine): number {
  if (m.denomination === '0.25') return 5000;
  if (m.denomination === '0.05') return 1200;
  if (m.multiDeno) return 900;
  if (m.type === 'Easy Bet') {
    return m.minBet >= 1.00 ? 700 : m.minBet >= 0.75 ? 550 : 400;
  }
  return m.minBet >= 0.25 ? 280 : m.minBet >= 0.10 ? 200 : 140;
}

export function generateSeedCoinIn(machines: SlotMachine[]): CoinInEntry[] {
  const entries: CoinInEntry[] = [];
  const today = new Date();

  for (let dayOffset = 89; dayOffset >= 0; dayOffset--) {
    const d = new Date(today);
    d.setDate(d.getDate() - dayOffset);
    const y = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${y}-${mo}-${day}`;

    for (const m of machines) {
      if (!m.active) continue;
      const base = baseDailyAmount(m);
      const rand = (hashNum(m.id + dateStr) % 600) / 1000; // 0.000 – 0.599
      const variance = 0.70 + rand; // 0.70 – 1.30
      entries.push({ machineId: m.id, date: dateStr, amount: Math.round(base * variance) });
    }
  }
  return entries;
}
