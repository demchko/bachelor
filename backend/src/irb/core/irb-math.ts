/**
 * Core mathematics for Ideal Ring Bundles (IRB / ІКВ).
 *
 * Reference:
 *   Riznyk V. V. — "Synthesis of optimal combinatorial systems" (1989, 2019, 2021).
 *
 * An n-element IRB is a cyclic sequence K_n = (k_1, …, k_n) of positive integers
 * such that all "ring" sums (sums of any number of consecutive elements,
 * 1 ≤ length ≤ n − 1) cover every integer from 1 to S − 1 exactly R times,
 * where the relation
 *     R · (S − 1) = n · (n − 1)
 * holds. The sum of all elements equals S itself.
 */

export interface CircularSum {
  start: number;
  length: number;
  elements: number[];
  sum: number;
}

/**
 * Theoretical perfect-coverage size: S = n(n − 1) / R + 1.
 * Returns Number.NaN when (n, R) does not satisfy divisibility constraint.
 */
export function computeS(n: number, r: number): number {
  if (n < 2 || r < 1) return Number.NaN;
  const numerator = n * (n - 1);
  if (numerator % r !== 0) return Number.NaN;
  return numerator / r + 1;
}

/** Sum of sequence elements — equals S for a perfect IRB. */
export function totalSum(sequence: number[]): number {
  return sequence.reduce((acc, value) => acc + value, 0);
}

/**
 * Generates every ring sum for a cyclic sequence:
 * for each starting index `start` ∈ [0, n) and each consecutive length `len` ∈ [1, n − 1].
 * The full-circle sum (length = n) is omitted because it is constant (= S).
 */
export function circularSums(sequence: number[]): CircularSum[] {
  const n = sequence.length;
  if (n === 0) return [];

  const result: CircularSum[] = [];
  for (let start = 0; start < n; start += 1) {
    let runningSum = 0;
    const elements: number[] = [];
    for (let len = 1; len <= n - 1; len += 1) {
      const value = sequence[(start + len - 1) % n];
      runningSum += value;
      elements.push(value);
      result.push({
        start,
        length: len,
        elements: [...elements],
        sum: runningSum,
      });
    }
  }
  return result;
}

export interface CoverageReport {
  s: number;
  /** counts[v] = number of ring sums producing value v (index 0 unused). */
  counts: number[];
  missing: number[];
  isIrb: boolean;
  rEffective: number;
}

/**
 * Checks IRB property given a candidate sequence and required redundancy R.
 * Returns full coverage report (counts per value, missing values, isIrb flag).
 */
export function analyzeCoverage(sequence: number[], r: number): CoverageReport {
  const n = sequence.length;
  if (n < 2) {
    return { s: 0, counts: [0], missing: [], isIrb: false, rEffective: 0 };
  }

  const expectedS = computeS(n, r);
  const targetSum = totalSum(sequence);

  const counts: number[] = new Array(targetSum + 1).fill(0);
  const sums = circularSums(sequence);
  for (const cs of sums) {
    if (cs.sum >= 1 && cs.sum <= targetSum) {
      counts[cs.sum] += 1;
    }
  }

  const s = Number.isFinite(expectedS) && expectedS > 0 ? expectedS : targetSum;

  const missing: number[] = [];
  let coveredOnce = 0;
  let allMatchR = true;

  const upper = Math.min(s - 1, counts.length - 1);
  for (let v = 1; v <= upper; v += 1) {
    if (counts[v] === 0) {
      missing.push(v);
    } else {
      coveredOnce += 1;
      if (counts[v] !== r) allMatchR = false;
    }
  }

  const isIrb =
    Number.isFinite(expectedS) &&
    targetSum === expectedS &&
    missing.length === 0 &&
    allMatchR &&
    coveredOnce === s - 1;

  const rEffective =
    coveredOnce > 0
      ? counts.slice(1, upper + 1).filter((c) => c > 0).reduce((acc, c) => acc + c, 0) /
        coveredOnce
      : 0;

  return { s, counts, missing, isIrb, rEffective };
}

/** Convenience boolean variant. */
export function isIrb(sequence: number[], r: number): boolean {
  return analyzeCoverage(sequence, r).isIrb;
}

/* ─── Equivalence (rotations + reflections) ─────────────────── */

/** All n cyclic shifts of a sequence. */
export function rotations(sequence: number[]): number[][] {
  const n = sequence.length;
  if (n === 0) return [];
  const out: number[][] = [];
  for (let k = 0; k < n; k += 1) {
    const shifted: number[] = [];
    for (let i = 0; i < n; i += 1) shifted.push(sequence[(i + k) % n]);
    out.push(shifted);
  }
  return out;
}

/** Reverse of a sequence — corresponds to reading the ring in opposite direction. */
export function reflection(sequence: number[]): number[] {
  return [...sequence].reverse();
}

function lexLess(a: number[], b: number[]): boolean {
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i += 1) {
    if (a[i] !== b[i]) return a[i] < b[i];
  }
  return a.length < b.length;
}

/**
 * Canonical form = lexicographically smallest sequence among all rotations
 * AND rotations of the reflection. Two IRBs are "equivalent" iff they share
 * the same canonical form.
 */
export function canonicalForm(sequence: number[]): number[] {
  const candidates = [...rotations(sequence), ...rotations(reflection(sequence))];
  let best = candidates[0];
  for (const c of candidates) if (lexLess(c, best)) best = c;
  return best;
}

/* ─── Catalogue of known IRBs (Riznyk) ─────────────────────── */

/**
 * Curated catalogue of well-known IRB seeds for small (n, R).
 * Each entry is verified at module load time via `isIrb` and filtered.
 * Source: V. V. Riznyk monographs and survey papers (1989, 2019, 2021).
 */
const RAW_KNOWN_IRBS: Record<string, number[][]> = {
  '3-1': [[1, 2, 4]],
  '4-1': [[1, 3, 2, 7]],
  '5-1': [[1, 3, 10, 2, 5]],
  '6-1': [[1, 2, 5, 4, 6, 13]],
  '4-2': [[1, 1, 2, 3]],
};

function buildKnownIrbs(raw: Record<string, number[][]>): Record<string, number[][]> {
  const result: Record<string, number[][]> = {};
  for (const [key, list] of Object.entries(raw)) {
    const [, rStr] = key.split('-');
    const r = parseInt(rStr, 10);
    const verified = list.filter((seq) => isIrb(seq, r));
    if (verified.length > 0) result[key] = verified;
  }
  return result;
}

export const KNOWN_IRBS: Record<string, number[][]> = buildKnownIrbs(RAW_KNOWN_IRBS);

export interface GenerateOptions {
  /** Search budget in milliseconds; defaults to 1500 ms. */
  timeBudgetMs?: number;
  /** Try the canonical curated table first. */
  useKnown?: boolean;
  /** Maximum number of distinct (canonical) variants to collect. */
  maxVariants?: number;
}

export interface GenerateResult {
  sequence: number[];
  used: 'known' | 'directed-search';
  attempts: number;
}

/* ─── Generation (single + multiple variants) ──────────────── */

/**
 * Directed-search generator following the algorithm from Riznyk (1989, p. 168):
 * incrementally builds a sequence by appending the next admissible integer
 * and back-tracks if any partial ring sum exceeds the required multiplicity R.
 */
export function generateIrb(n: number, r: number, options: GenerateOptions = {}): GenerateResult {
  if (n < 2 || r < 1) {
    throw new Error(`Invalid IRB parameters: n=${n}, r=${r}`);
  }

  const useKnown = options.useKnown ?? true;
  const key = `${n}-${r}`;
  if (useKnown && KNOWN_IRBS[key]?.length) {
    return { sequence: [...KNOWN_IRBS[key][0]], used: 'known', attempts: 0 };
  }

  const expectedS = computeS(n, r);
  if (!Number.isFinite(expectedS)) {
    throw new Error(
      `IRB does not exist for n=${n}, r=${r} — n(n − 1) is not divisible by R.`,
    );
  }

  const found = directedSearch(n, r, expectedS, options.timeBudgetMs ?? 1500, 1);
  if (found.length > 0) {
    return { sequence: found[0], used: 'directed-search', attempts: 0 };
  }
  throw new Error(
    `IRB(n=${n}, R=${r}) was not found within the search budget — try smaller n.`,
  );
}

/**
 * Returns several distinct IRB sequences (by canonical form) for given (n, R).
 * Pulls from the known catalogue first, then runs a directed search to collect more.
 */
export function generateVariants(n: number, r: number, max = 5, timeBudgetMs = 2500): number[][] {
  const expectedS = computeS(n, r);
  if (!Number.isFinite(expectedS)) return [];

  const collected: number[][] = [];
  const seenCanon = new Set<string>();

  const tryAdd = (seq: number[]) => {
    if (collected.length >= max) return;
    const canon = canonicalForm(seq);
    const key = canon.join(',');
    if (!seenCanon.has(key)) {
      seenCanon.add(key);
      collected.push(seq);
    }
  };

  for (const seq of KNOWN_IRBS[`${n}-${r}`] ?? []) {
    if (isIrb(seq, r)) tryAdd(seq);
  }

  if (collected.length < max) {
    const found = directedSearch(n, r, expectedS, timeBudgetMs, max - collected.length, seenCanon);
    for (const seq of found) tryAdd(seq);
  }

  return collected;
}

function directedSearch(
  n: number,
  r: number,
  expectedS: number,
  timeBudgetMs: number,
  needed: number,
  alreadySeenCanon = new Set<string>(),
): number[][] {
  const targetSum = expectedS;
  const deadline = Date.now() + timeBudgetMs;
  const path: number[] = [1];
  const maxElement = Math.max(targetSum - n + 1, 4);
  const found: number[][] = [];
  const seen = new Set<string>(alreadySeenCanon);

  /**
   * Linear (non-wrapping) partial sums inside the current prefix —
   * every such sum will be a ring sum in the final IRB, so its count
   * must already be ≤ R during construction.
   */
  function linearPartialSums(seq: number[]): Map<number, number> {
    const occ = new Map<number, number>();
    const len = seq.length;
    for (let start = 0; start < len; start += 1) {
      let s = 0;
      for (let l = 1; l <= len - start; l += 1) {
        s += seq[start + l - 1];
        occ.set(s, (occ.get(s) ?? 0) + 1);
      }
    }
    return occ;
  }

  /** Full cyclic ring sums for the closed sequence of length n (final check). */
  function ringSumsClosed(seq: number[]): Map<number, number> {
    const occ = new Map<number, number>();
    const len = seq.length;
    for (let start = 0; start < len; start += 1) {
      let s = 0;
      for (let l = 1; l <= len - 1; l += 1) {
        s += seq[(start + l - 1) % len];
        occ.set(s, (occ.get(s) ?? 0) + 1);
      }
    }
    return occ;
  }

  function search(currentSum: number): boolean {
    if (Date.now() > deadline) return true;
    if (found.length >= needed) return true;

    if (path.length === n) {
      if (currentSum !== targetSum) return false;
      const occ = ringSumsClosed(path);
      for (let v = 1; v <= targetSum - 1; v += 1) {
        if ((occ.get(v) ?? 0) !== r) return false;
      }
      const seq = [...path];
      const canon = canonicalForm(seq).join(',');
      if (!seen.has(canon)) {
        seen.add(canon);
        found.push(seq);
      }
      return false;
    }

    // After pushing `cand`, we still have to add (remaining − 1) more
    // positive integers (each ≥ 1) to reach a total length of n.
    const remaining = n - path.length;
    const minSlackAfter = remaining - 1;
    const maxSlackAfter = (remaining - 1) * maxElement;

    for (let cand = 1; cand <= maxElement; cand += 1) {
      const newSum = currentSum + cand;
      if (newSum + minSlackAfter > targetSum) break;
      if (newSum + maxSlackAfter < targetSum) continue;

      path.push(cand);
      const occ = linearPartialSums(path);
      let ok = true;
      for (const [value, count] of occ) {
        if (value <= targetSum - 1 && count > r) {
          ok = false;
          break;
        }
      }
      if (ok && search(newSum)) {
        path.pop();
        return true;
      }
      path.pop();
    }
    return false;
  }

  search(1);
  return found;
}

/* ─── Rich properties ──────────────────────────────────────── */

export interface IrbProperties {
  n: number;
  r: number;
  s: number;
  sequence: number[];
  totalSum: number;
  expectedSum: number;
  isValid: boolean;
  canonical: number[];
  reflection: number[];
  rotations: number[][];
  distinctRingSums: number;
  redundancyEffective: number;
  /** Δ = max element − min element. */
  spread: number;
  /** Bit-efficiency upper bound for codes built on this IRB. */
  bitsPerSymbol: number;
  /** Information capacity log2(S − 1). */
  capacityBits: number;
}

export function computeProperties(sequence: number[], r: number): IrbProperties {
  const report = analyzeCoverage(sequence, r);
  const n = sequence.length;
  const totalS = totalSum(sequence);
  const expectedS = computeS(n, r);
  const ringSums = circularSums(sequence);
  const distinct = new Set(ringSums.map((cs) => cs.sum)).size;

  const minEl = Math.min(...sequence);
  const maxEl = Math.max(...sequence);
  const capacity = report.s > 1 ? Math.log2(report.s - 1) : 0;

  return {
    n,
    r,
    s: Number.isFinite(expectedS) ? expectedS : totalS,
    sequence: [...sequence],
    totalSum: totalS,
    expectedSum: Number.isFinite(expectedS) ? expectedS : totalS,
    isValid: report.isIrb,
    canonical: canonicalForm(sequence),
    reflection: reflection(sequence),
    rotations: rotations(sequence),
    distinctRingSums: distinct,
    redundancyEffective: report.rEffective,
    spread: maxEl - minEl,
    bitsPerSymbol: n > 0 ? capacity / n : 0,
    capacityBits: capacity,
  };
}

/** Returns the catalogue as an array of structured entries. */
export function presetEntries(): { n: number; r: number; sequence: number[] }[] {
  const out: { n: number; r: number; sequence: number[] }[] = [];
  for (const [key, list] of Object.entries(KNOWN_IRBS)) {
    const [n, r] = key.split('-').map((x) => parseInt(x, 10));
    for (const seq of list) {
      out.push({ n, r, sequence: seq });
    }
  }
  return out.sort((a, b) => a.n - b.n || a.r - b.r);
}
