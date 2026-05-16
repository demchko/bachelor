/**
 * Cyclic IRB-code — client copy of `backend/src/codes/core/cyclic-code.ts`.
 * Keep in sync when changing the construction on the server.
 */

import { fromBitArray, hammingDistance, toBitArray } from './binary-utils';

export interface CyclicCode {
  n: number;
  k: number;
  rParity: number;
  differenceSet: number[];
  generator: number[][];
  parityCheck: number[][];
  syndromeTable: Map<string, number>;
  informationColumns: number[];
}

function buildDifferenceSet(sequence: number[]): { S: number; set: number[] } {
  const S = sequence.reduce((a, b) => a + b, 0);
  const set: number[] = [0];
  let acc = 0;
  for (let i = 0; i < sequence.length - 1; i += 1) {
    acc += sequence[i];
    set.push(acc % S);
  }
  return { S, set: Array.from(new Set(set)).sort((a, b) => a - b) };
}

function key(v: number[]): string {
  return v.join('');
}

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

export function buildCyclicCode(sequence: number[]): CyclicCode {
  const { S, set } = buildDifferenceSet(sequence);
  const indicator = new Array(S).fill(0);
  for (const idx of set) indicator[idx] = 1;

  const Hfull: number[][] = [];
  for (let shift = 0; shift < set.length; shift += 1) {
    const row = new Array(S).fill(0);
    for (let i = 0; i < S; i += 1) row[i] = indicator[(i - shift + S) % S];
    Hfull.push(row);
  }

  const H = reducedRowEchelon(Hfull);
  const rParity = H.length;
  const k = S - rParity;

  const { generator: G, informationColumns } = buildGeneratorFromParity(H, S);

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

export interface EncodeResult {
  codeword: string;
  blockLength: number;
  dataLength: number;
}

export function encodeCyclic(code: CyclicCode, dataBits: string): EncodeResult {
  const data = toBitArray(dataBits);
  if (data.length !== code.k) {
    throw new Error(`Очікувана довжина даних: ${code.k} біт, отримано: ${data.length}.`);
  }
  const c = vecMatMul(data, code.generator);
  return {
    codeword: fromBitArray(c),
    blockLength: code.n,
    dataLength: code.k,
  };
}

export interface DecodeResult {
  corrected: string;
  decoded: string;
  errorPositions: number[];
  detectedErrors: number;
  correctedErrors: number;
  uncorrected: boolean;
}

export function decodeCyclic(code: CyclicCode, receivedBits: string, originalCodeword?: string): DecodeResult {
  const received = toBitArray(receivedBits);
  if (received.length !== code.n) {
    throw new Error(`Довжина прийнятого кодового слова має бути ${code.n}, отримано: ${received.length}.`);
  }
  const Ht = transpose(code.parityCheck);
  const synd = vecMatMul(received, Ht);
  const synKey = synd.join('');
  const errorPos = code.syndromeTable.get(synKey);

  let corrected = received.slice();
  const errorPositions: number[] = [];
  let uncorrected = false;

  if (synd.every((b) => b === 0)) {
    // no error
  } else if (errorPos === undefined || errorPos === -1) {
    uncorrected = true;
  } else {
    corrected[errorPos] ^= 1;
    errorPositions.push(errorPos);
  }

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
