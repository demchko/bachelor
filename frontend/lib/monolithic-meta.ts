import type { MonolithicMetaResult } from '@/lib/api';

/** Mirrors `buildMonolithicCodebook` in the Nest backend (no network). */
export function computeMonolithicMeta(sequenceLength: number): MonolithicMetaResult | null {
  if (sequenceLength < 2) return null;
  const n = sequenceLength;
  const codewords: string[] = [];
  for (let w = 0; w <= n; w += 1) {
    codewords.push('1'.repeat(w) + '0'.repeat(n - w));
  }
  return {
    blockLength: n,
    symbolWidth: Math.ceil(Math.log2(n + 1)),
    codewords,
    capacitySymbols: n + 1,
  };
}
