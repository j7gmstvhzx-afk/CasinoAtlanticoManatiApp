// Descriptive statistics helpers for the Análisis tab.
// All functions are pure and tolerate empty input (returning zeros) so the
// dashboard renders gracefully while data is still loading.

export type Describe = {
  n: number;
  mean: number;
  median: number;
  sd: number;       // population standard deviation
  cv: number;       // coefficient of variation, % (sd / mean)
  q1: number;
  q3: number;
  iqr: number;
  min: number;
  max: number;
};

export function mean(values: number[]): number {
  return values.length ? values.reduce((s, v) => s + v, 0) / values.length : 0;
}

// Linear-interpolated quantile over an ASCENDING-sorted array, q in [0, 1].
export function quantileSorted(sorted: number[], q: number): number {
  if (sorted.length === 0) return 0;
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

export function median(values: number[]): number {
  return quantileSorted([...values].sort((a, b) => a - b), 0.5);
}

export function stddev(values: number[]): number {
  if (values.length === 0) return 0;
  const m = mean(values);
  return Math.sqrt(values.reduce((s, v) => s + (v - m) ** 2, 0) / values.length);
}

export function describe(values: number[]): Describe {
  const sorted = [...values].sort((a, b) => a - b);
  const m  = mean(sorted);
  const sd = stddev(sorted);
  const q1 = quantileSorted(sorted, 0.25);
  const q3 = quantileSorted(sorted, 0.75);
  return {
    n:      sorted.length,
    mean:   m,
    median: quantileSorted(sorted, 0.5),
    sd,
    cv:     m > 0 ? (sd / m) * 100 : 0,
    q1,
    q3,
    iqr:    q3 - q1,
    min:    sorted[0] ?? 0,
    max:    sorted[sorted.length - 1] ?? 0,
  };
}
