/**
 * Monolithic IRB-code (client mirror of `backend/src/codes/core/monolithic-code.ts`).
 * Keep in sync when changing encode/decode behaviour on the server.
 */

import { fromBitArray, toBitArray } from './binary-utils';

export interface MonolithicCodebook {
  n: number;
  codewords: string[];
  encodeMap: Map<number, string>;
}

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
      throw new Error(`Символ ${value} перевищує максимальну вагу ${book.n} монолітного коду.`);
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

function correctSingleWord(word: number[]): {
  corrected: number[];
  errorPositions: number[];
  uncorrected: boolean;
} {
  const n = word.length;
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
