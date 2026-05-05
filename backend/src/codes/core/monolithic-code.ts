/**
 * Monolithic IRB-code.
 *
 * From the article (Riznyk, 2021):
 *   "A monolithic code is a code whose allowed combinations consist of two adjacent
 *    blocks of identical symbols ('packets' of '0's and '1's)."
 *
 * Construction used here:
 *   - Block length n is the IRB sequence length.
 *   - For an IRB K_n = (k_1, …, k_n), the i-th allowed monolithic codeword has the
 *     form 1^{a_i} 0^{n − a_i} where a_i is the i-th cumulative cyclic sum mod n.
 *   - Decoding by majority rule: scan the received word, find the boundary between
 *     the longest contiguous '1'-run and '0'-run; flip stray symbols inside the
 *     "wrong" zone.
 *
 * Error-detection / correction efficiency formulae (article 1, eq. (2)):
 *     N_1(n, r) = C(n − 4, r),    n ≥ 4
 *     N_2(n, r) = C(n − 8, r),    n ≥ 8
 * The (n − 4) / (n − 8) windows are due to the boundary-zone padding.
 */

import { comb, fromBitArray, toBitArray } from './binary-utils';

export interface MonolithicCodebook {
  n: number;
  /** Allowed codewords (one per possible weight 0..n). */
  codewords: string[];
  /** Map from data symbol index → codeword. */
  encodeMap: Map<number, string>;
}

/** Generates the codebook of (n + 1) monolithic codewords (for k weights 0..n). */
export function buildMonolithicCodebook(n: number): MonolithicCodebook {
  if (n < 2) throw new Error('Довжина монолітного коду має бути ≥ 2.');
  const codewords: string[] = [];
  const encodeMap = new Map<number, string>();
  for (let weight = 0; weight <= n; weight += 1) {
    const word = '1'.repeat(weight) + '0'.repeat(n - weight);
    codewords.push(word);
    encodeMap.set(weight, word);
  }
  return { n, codewords, encodeMap };
}

/**
 * Encodes a data block expressed as an integer weight 0..n into its monolithic
 * codeword. For data wider than ⌈log2(n + 1)⌉ bits the helper splits the input
 * stream into chunks of that width.
 */
export function encodeMonolithic(book: MonolithicCodebook, dataBits: string): string {
  const data = toBitArray(dataBits);
  const symbolWidth = Math.ceil(Math.log2(book.n + 1));
  if (data.length % symbolWidth !== 0) {
    throw new Error(
      `Довжина даних (${data.length}) має бути кратна ${symbolWidth} біт для монолітного коду n=${book.n}.`,
    );
  }
  const chunks: number[] = [];
  for (let i = 0; i < data.length; i += symbolWidth) {
    const chunk = data.slice(i, i + symbolWidth);
    const value = chunk.reduce((acc, b) => acc * 2 + b, 0);
    if (value > book.n) {
      throw new Error(
        `Символ ${value} перевищує максимальну вагу ${book.n} монолітного коду.`,
      );
    }
    chunks.push(value);
  }
  return chunks.map((w) => book.encodeMap.get(w) ?? '').join('');
}

export interface MonolithicDecodeResult {
  corrected: string;
  decoded: string;
  errorPositions: number[];
  detectedErrors: number;
  correctedErrors: number;
  uncorrected: boolean;
}

/** Majority-logic correction inside a single monolithic codeword. */
function correctSingleWord(word: number[]): {
  corrected: number[];
  errorPositions: number[];
  uncorrected: boolean;
} {
  const n = word.length;
  // Find the threshold position that minimizes Hamming distance to a perfect
  // monolithic word 1^w 0^{n-w} for w ∈ [0, n].
  let bestW = 0;
  let bestDist = Number.POSITIVE_INFINITY;
  for (let w = 0; w <= n; w += 1) {
    let dist = 0;
    for (let i = 0; i < n; i += 1) {
      const expected = i < w ? 1 : 0;
      if (word[i] !== expected) dist += 1;
    }
    if (dist < bestDist) {
      bestDist = dist;
      bestW = w;
    }
  }
  const corrected = new Array(n).fill(0);
  for (let i = 0; i < bestW; i += 1) corrected[i] = 1;

  const errorPositions: number[] = [];
  for (let i = 0; i < n; i += 1) {
    if (corrected[i] !== word[i]) errorPositions.push(i);
  }

  // For boundary symbols (within 1 position of w − 1) correction probability is 0.5,
  // so we mark uncorrected only if multiple errors occurred near the boundary.
  const uncorrected = bestDist > Math.floor(n / 4);
  return { corrected, errorPositions, uncorrected };
}

export function decodeMonolithic(
  book: MonolithicCodebook,
  receivedBits: string,
  originalCodeword?: string,
): MonolithicDecodeResult {
  const received = toBitArray(receivedBits);
  if (received.length === 0 || received.length % book.n !== 0) {
    throw new Error(
      `Довжина прийнятого слова має бути кратна ${book.n}, отримано: ${received.length}.`,
    );
  }
  const symbolWidth = Math.ceil(Math.log2(book.n + 1));
  const chunks: number[][] = [];
  for (let i = 0; i < received.length; i += book.n) {
    chunks.push(received.slice(i, i + book.n));
  }

  const correctedAll: number[] = [];
  const errorPositions: number[] = [];
  let totalErrors = 0;
  let unrec = false;
  const decoded: number[] = [];

  for (let idx = 0; idx < chunks.length; idx += 1) {
    const fix = correctSingleWord(chunks[idx]);
    correctedAll.push(...fix.corrected);
    for (const pos of fix.errorPositions) errorPositions.push(pos + idx * book.n);
    totalErrors += fix.errorPositions.length;
    if (fix.uncorrected) unrec = true;
    const w = fix.corrected.reduce((s, b) => s + b, 0);
    // Convert weight to bit-vector of width `symbolWidth`.
    for (let bit = symbolWidth - 1; bit >= 0; bit -= 1) {
      decoded.push((w >> bit) & 1);
    }
  }

  let detectedErrors = totalErrors;
  if (originalCodeword !== undefined) {
    const orig = toBitArray(originalCodeword);
    detectedErrors = 0;
    for (let i = 0; i < Math.min(orig.length, received.length); i += 1) {
      if (orig[i] !== received[i]) detectedErrors += 1;
    }
  }

  return {
    corrected: fromBitArray(correctedAll),
    decoded: fromBitArray(decoded),
    errorPositions,
    detectedErrors,
    correctedErrors: totalErrors,
    uncorrected: unrec,
  };
}

/* ─── Efficiency analytics from article 1 ─────────────────────── */

export interface EfficiencyResult {
  n: number;
  r: number;
  total: number;
  detectable: number;
  correctable: number;
  detectablePct: number;
  correctablePct: number;
}

/**
 * Heuristic efficiency from formulas (2) of the comparative-analysis article:
 *   N_1(n, r) = C(n − 4, r), n ≥ 4
 *   N_2(n, r) = C(n − 8, r), n ≥ 8
 * Total number of n-bit words with r symbol errors is C(n, r).
 */
export function efficiencyMonolithic(n: number, r: number): EfficiencyResult {
  const total = comb(n, r);
  const detectable = n >= 4 ? comb(n - 4, r) : 0;
  const correctable = n >= 8 ? comb(n - 8, r) : 0;
  const detectablePct = total > 0 ? (detectable / total) * 100 : 0;
  const correctablePct = total > 0 ? (correctable / total) * 100 : 0;
  return {
    n,
    r,
    total,
    detectable,
    correctable,
    detectablePct: Math.round(detectablePct * 10) / 10,
    correctablePct: Math.round(correctablePct * 10) / 10,
  };
}

/**
 * Cyclic IRB-code efficiency from Table 4 of the article (asymptotic limits 50% and 25%).
 *   detected up to (n − 1), corrected up to (n − 1) / 2 for even n
 *   detected up to n,       corrected up to (n − 1) / 2 for odd n
 *
 * Here we compute the *fraction* of detectable / correctable error patterns
 * given a fixed number of symbol errors r, as ratios over C(S, r).
 */
export function efficiencyCyclic(n: number, r: number): EfficiencyResult {
  const S = n * (n - 1) + 1; // S = n(n − 1) + 1 for R = 1 standard cyclic IRB
  const t1 = n - 1; // detection capability
  const t2 = Math.floor((n - 1) / 2); // correction capability

  const total = comb(S, r);
  const detectable = r <= t1 ? comb(S, r) : 0;
  const correctable = r <= t2 ? comb(S, r) : 0;
  return {
    n,
    r,
    total,
    detectable,
    correctable,
    detectablePct: detectable === total && total > 0 ? Math.min(100, ((t1 / S) * 100)) : 0,
    correctablePct: correctable === total && total > 0 ? Math.min(100, ((t2 / S) * 100)) : 0,
  };
}

/* ─── Numerical "trapezoid" table from the article ─────────────── */

export interface TrapezoidRow {
  n: number;
  coefficients: number[];
  sum: number;
  xn: number;
}

/**
 * Builds the "trapezoid" coefficient table used to count detectable error
 * combinations of an n-bit cyclic monolithic code (article 1, table 3).
 * Each row has 2(n − 3) + 1 coefficients of the form
 *   { n − 3, n − 4, …, n − 4, n − 3 } (centered triangle).
 */
export function trapezoid(maxN: number): TrapezoidRow[] {
  const rows: TrapezoidRow[] = [];
  for (let n = 4; n <= maxN; n += 1) {
    const coefficients: number[] = [];
    coefficients.push(n - 3);
    const innerCount = 2 * (n - 3) - 2;
    for (let i = 0; i < innerCount; i += 1) coefficients.push(n - 4);
    coefficients.push(n - 3);
    const sum = coefficients.reduce((a, b) => a + b, 0);
    rows.push({ n, coefficients, sum, xn: n * sum });
  }
  return rows;
}
