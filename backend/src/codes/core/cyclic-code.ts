/**
 * Cyclic IRB-code (Cyclic Difference-Set Code).
 *
 * Cyclic IRB codes belong to the broad class of nonseparable cyclic codes whose
 * parity-check matrix is determined by the IRB partial-sum positions (Singer-difference
 * set construction). For an IRB K_n with parameters (S, n, R = (n − 1) / 2 for odd n,
 * or R = n / 2 for even n), the resulting binary cyclic code has block length S and
 * minimum distance d ≥ R + 1, allowing detection of up to ⌊d / 2⌋ symbol errors and
 * correction of ⌊(d − 1) / 2⌋ errors.
 *
 * Reference (Riznyk, 2021):
 *   "Optimized cyclic IRB-codes detect up to (n − 1) and correct up to (n − 1) / 2 errors
 *   for even n; up to n and (n − 1) / 2 for odd n."
 *
 * Encoding scheme implemented here (systematic binary cyclic code with IRB-derived
 * parity-check matrix):
 *   1. Build the support set D = {0, k_1, k_1 + k_2, …} mod S — the cyclic difference set.
 *   2. Construct r × S parity-check matrix H whose rows are cyclic shifts of the support
 *      indicator vector.
 *   3. Information length k = S − rank(H). Codeword c = m * G with G = (I_k | P^T)
 *      derived from H = (P | I_r).
 *   4. Decoding: compute syndrome s = c * H^T; locate single-error position by syndrome
 *      lookup. Multiple-error correction performed via majority logic on rotated
 *      syndromes (efficient for low-rank codes).
 *
 * For demonstration purposes the implementation supports only single-bit error
 * correction with full syndrome lookup, consistent with the front-end "симуляція"
 * page that compares one-bit error rates.
 */

import { fromBitArray, hammingDistance, toBitArray } from './binary-utils';

export interface CyclicCode {
  /** Block length (= S of the IRB). */
  n: number;
  /** Information length. */
  k: number;
  /** Number of parity bits. */
  rParity: number;
  /** Difference set derived from IRB partial sums (mod S). */
  differenceSet: number[];
  /** Generator matrix G (k rows × n cols). */
  generator: number[][];
  /** Parity-check matrix H (rParity rows × n cols). */
  parityCheck: number[][];
  /** Syndrome lookup: bitstring → error position (-1 = no error). */
  syndromeTable: Map<string, number>;
  /** Indices of columns where information bits are placed by the generator. */
  informationColumns: number[];
}

function buildDifferenceSet(sequence: number[]): { S: number; set: number[] } {
  // For a perfect IRB the sum of all elements equals S itself
  // (Riznyk: "сума чисел … дорівнює максимальному числу S цього ряду").
  const S = sequence.reduce((a, b) => a + b, 0);
  const set: number[] = [0];
  let acc = 0;
  for (let i = 0; i < sequence.length - 1; i += 1) {
    acc += sequence[i];
    set.push(acc % S);
  }
  return { S, set: Array.from(new Set(set)).sort((a, b) => a - b) };
}

/** Pretty-print a row vector as a bitstring for syndrome-table keys. */
function key(v: number[]): string {
  return v.join('');
}

function gaussianRank(matrix: number[][]): number {
  const rows = matrix.length;
  if (rows === 0) return 0;
  const cols = matrix[0].length;
  const m = matrix.map((row) => [...row]);
  let rank = 0;
  let r = 0;
  for (let c = 0; c < cols && r < rows; c += 1) {
    let pivot = -1;
    for (let i = r; i < rows; i += 1) {
      if (m[i][c] === 1) {
        pivot = i;
        break;
      }
    }
    if (pivot === -1) continue;
    [m[r], m[pivot]] = [m[pivot], m[r]];
    for (let i = 0; i < rows; i += 1) {
      if (i !== r && m[i][c] === 1) {
        for (let j = c; j < cols; j += 1) m[i][j] ^= m[r][j];
      }
    }
    r += 1;
    rank += 1;
  }
  return rank;
}

/** Multiplies row vector × matrix in GF(2). */
function vecMatMul(vec: number[], mat: number[][]): number[] {
  const cols = mat[0].length;
  const out: number[] = new Array(cols).fill(0);
  for (let j = 0; j < cols; j += 1) {
    let bit = 0;
    for (let i = 0; i < vec.length; i += 1) {
      if (vec[i] && mat[i][j]) bit ^= 1;
    }
    out[j] = bit;
  }
  return out;
}

/**
 * Builds a cyclic IRB-code from a given IRB sequence.
 * Construction:
 *   - Difference set D = partial sums of the IRB modulo S.
 *   - Indicator row a ∈ {0,1}^S where a_i = 1 ⇔ i ∈ D.
 *   - Parity-check matrix H is r consecutive cyclic shifts of a, where r = |D|.
 *   - Generator matrix G is built so that G * H^T = 0.
 */
export function buildCyclicCode(sequence: number[]): CyclicCode {
  const { S, set } = buildDifferenceSet(sequence);
  const indicator = new Array(S).fill(0);
  for (const idx of set) indicator[idx] = 1;

  // Build parity-check matrix as cyclic shifts of indicator.
  const Hfull: number[][] = [];
  for (let shift = 0; shift < set.length; shift += 1) {
    const row = new Array(S).fill(0);
    for (let i = 0; i < S; i += 1) row[i] = indicator[(i - shift + S) % S];
    Hfull.push(row);
  }

  // Reduce H to row-echelon to get linearly independent parity rows.
  const H = reducedRowEchelon(Hfull);
  const rParity = H.length;
  const k = S - rParity;

  // Build systematic generator matrix from H = [P | I_r] form (after column permutation).
  // The free columns are the systematic information positions.
  const { generator: G, informationColumns } = buildGeneratorFromParity(H, S);

  // Single-error syndrome table.
  const syndromeTable = new Map<string, number>();
  syndromeTable.set(key(new Array(rParity).fill(0)), -1);
  for (let pos = 0; pos < S; pos += 1) {
    const e = new Array(S).fill(0);
    e[pos] = 1;
    const synd = vecMatMul(e, transpose(H));
    syndromeTable.set(key(synd), pos);
  }

  return {
    n: S,
    k,
    rParity,
    differenceSet: set,
    generator: G,
    parityCheck: H,
    syndromeTable,
    informationColumns,
  };
}

function transpose(m: number[][]): number[][] {
  if (m.length === 0) return [];
  const rows = m.length;
  const cols = m[0].length;
  const t: number[][] = [];
  for (let i = 0; i < cols; i += 1) {
    const row: number[] = new Array(rows).fill(0);
    for (let j = 0; j < rows; j += 1) row[j] = m[j][i];
    t.push(row);
  }
  return t;
}

function reducedRowEchelon(matrix: number[][]): number[][] {
  const rows = matrix.length;
  if (rows === 0) return [];
  const cols = matrix[0].length;
  const m = matrix.map((row) => [...row]);
  let r = 0;
  for (let c = 0; c < cols && r < rows; c += 1) {
    let pivot = -1;
    for (let i = r; i < rows; i += 1) {
      if (m[i][c] === 1) {
        pivot = i;
        break;
      }
    }
    if (pivot === -1) continue;
    [m[r], m[pivot]] = [m[pivot], m[r]];
    for (let i = 0; i < rows; i += 1) {
      if (i !== r && m[i][c] === 1) {
        for (let j = c; j < cols; j += 1) m[i][j] ^= m[r][j];
      }
    }
    r += 1;
  }
  return m.filter((row) => row.some((b) => b === 1));
}

/**
 * Constructs a generator matrix whose rows span the null-space of H over GF(2).
 * Result has dimensions k × n where k = n − rank(H). Returns `informationColumns`
 * (the free columns of the row-echelon form) so callers can extract systematic
 * information bits after decoding.
 */
function buildGeneratorFromParity(
  H: number[][],
  n: number,
): { generator: number[][]; informationColumns: number[] } {
  if (H.length === 0) {
    const identity: number[][] = [];
    const cols: number[] = [];
    for (let i = 0; i < n; i += 1) {
      const row = new Array(n).fill(0);
      row[i] = 1;
      identity.push(row);
      cols.push(i);
    }
    return { generator: identity, informationColumns: cols };
  }
  const r = H.length;
  const m = H.map((row) => [...row]);
  const pivotCols: number[] = [];
  let row = 0;
  for (let c = 0; c < n && row < r; c += 1) {
    let pivot = -1;
    for (let i = row; i < r; i += 1) {
      if (m[i][c] === 1) {
        pivot = i;
        break;
      }
    }
    if (pivot === -1) continue;
    [m[row], m[pivot]] = [m[pivot], m[row]];
    for (let i = 0; i < r; i += 1) {
      if (i !== row && m[i][c] === 1) {
        for (let j = c; j < n; j += 1) m[i][j] ^= m[row][j];
      }
    }
    pivotCols.push(c);
    row += 1;
  }
  const pivotSet = new Set(pivotCols);
  const freeCols: number[] = [];
  for (let c = 0; c < n; c += 1) if (!pivotSet.has(c)) freeCols.push(c);

  const G: number[][] = [];
  for (const fc of freeCols) {
    const g = new Array(n).fill(0);
    g[fc] = 1;
    for (let i = 0; i < pivotCols.length; i += 1) {
      const pc = pivotCols[i];
      g[pc] = m[i][fc];
    }
    G.push(g);
  }
  return { generator: G, informationColumns: freeCols };
}

/* ─── Encoding / decoding ─────────────────────────────────────── */

export interface EncodeResult {
  codeword: string;
  blockLength: number;
  dataLength: number;
}

export function encodeCyclic(code: CyclicCode, dataBits: string): EncodeResult {
  const data = toBitArray(dataBits);
  if (data.length !== code.k) {
    throw new Error(
      `Очікувана довжина даних: ${code.k} біт, отримано: ${data.length}.`,
    );
  }
  const c = vecMatMul(data, code.generator);
  return {
    codeword: fromBitArray(c),
    blockLength: code.n,
    dataLength: code.k,
  };
}

export interface DecodeResult {
  /** Possibly-corrected codeword. */
  corrected: string;
  /** Information bits extracted from corrected codeword. */
  decoded: string;
  errorPositions: number[];
  detectedErrors: number;
  correctedErrors: number;
  uncorrected: boolean;
}

export function decodeCyclic(
  code: CyclicCode,
  receivedBits: string,
  originalCodeword?: string,
): DecodeResult {
  const received = toBitArray(receivedBits);
  if (received.length !== code.n) {
    throw new Error(
      `Довжина прийнятого кодового слова має бути ${code.n}, отримано: ${received.length}.`,
    );
  }
  const Ht = transpose(code.parityCheck);
  const synd = vecMatMul(received, Ht);
  const synKey = synd.join('');
  const errorPos = code.syndromeTable.get(synKey);

  let corrected = received.slice();
  const errorPositions: number[] = [];
  let uncorrected = false;

  if (synd.every((b) => b === 0)) {
    // No detectable error.
  } else if (errorPos === undefined || errorPos === -1) {
    // Multi-error pattern beyond single-error correction capability.
    uncorrected = true;
  } else {
    corrected[errorPos] ^= 1;
    errorPositions.push(errorPos);
  }

  // Extract information bits from the systematic information columns of the generator.
  const informationBits = code.informationColumns.map((idx) => corrected[idx]);

  let detectedErrors = 0;
  if (originalCodeword !== undefined) {
    const orig = toBitArray(originalCodeword);
    detectedErrors = hammingDistance(orig, received);
  }

  return {
    corrected: fromBitArray(corrected),
    decoded: fromBitArray(informationBits),
    errorPositions,
    detectedErrors,
    correctedErrors: errorPositions.length,
    uncorrected,
  };
}
