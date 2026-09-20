/** Shared performance measurement helpers. Observation-only. */

export function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? ((sorted[mid - 1]! + sorted[mid]!) / 2)
    : sorted[mid]!;
}

export function percentile(values: number[], p: number): number | null {
  if (!values.length) return null;
  if (values.length < 5 && p >= 95) {
    // Honest: p95 needs adequate sample count; still report max-aware estimate with note.
  }
  const sorted = [...values].sort((a, b) => a - b);
  const rank = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(sorted.length - 1, rank))]!;
}

export function summarize(values: number[], opts: { minSamplesForP95?: number } = {}) {
  const minForP95 = opts.minSamplesForP95 ?? 10;
  return {
    sampleCount: values.length,
    min: values.length ? Math.min(...values) : null,
    max: values.length ? Math.max(...values) : null,
    median: median(values),
    p95: values.length >= minForP95 ? percentile(values, 95) : null,
    p95Claim: values.length >= minForP95 ? 'MEASURED' as const : 'INSUFFICIENT_SAMPLES' as const,
    mean: values.length ? values.reduce((a, b) => a + b, 0) / values.length : null,
  };
}

export async function freePort(): Promise<number> {
  const { createServer } = await import('node:net');
  const probe = createServer();
  await new Promise<void>(resolve => probe.listen(0, '127.0.0.1', resolve));
  const port = (probe.address() as { port: number }).port;
  await new Promise<void>(resolve => probe.close(() => resolve()));
  return port;
}

export function hrMs(start: bigint, end: bigint = process.hrtime.bigint()): number {
  return Number(end - start) / 1e6;
}
