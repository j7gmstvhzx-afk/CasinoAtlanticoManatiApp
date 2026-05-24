import type { CoinInPeriod } from '@/types/domain';

export function startOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 0, 1);
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function startOfQuarter(date: Date): Date {
  const q = Math.floor(date.getMonth() / 3) * 3;
  return new Date(date.getFullYear(), q, 1);
}

export function subDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - n);
  return d;
}

export function subMonths(date: Date, n: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() - n);
  return d;
}

export function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayString(): string {
  return toDateString(new Date());
}

export function periodStart(period: CoinInPeriod): Date {
  const today = new Date();
  switch (period) {
    case 'ytd': return startOfYear(today);
    case 'mtd': return startOfMonth(today);
    case 'quarterly': return startOfQuarter(today);
    case 'semiannual': return subMonths(today, 6);
    case 'annual': return subDays(today, 365);
  }
}

export function calcPeriodTotal(
  entries: Array<{ date: string; amount: number }>,
  period: CoinInPeriod
): number {
  const fromStr = toDateString(periodStart(period));
  const toStr = todayString();
  return entries.reduce((sum, e) => {
    if (e.date >= fromStr && e.date <= toStr) return sum + e.amount;
    return sum;
  }, 0);
}
