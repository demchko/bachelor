/** Tiny helpers for working with bit-strings. */

export function toBitArray(bits: string): number[] {
  if (!/^[01]+$/.test(bits)) {
    throw new Error('Бітовий рядок має містити лише символи 0 та 1.');
  }
  return Array.from(bits, (c) => (c === '1' ? 1 : 0));
}

export function fromBitArray(arr: number[]): string {
  return arr.map((b) => (b ? '1' : '0')).join('');
}

export function flipBit(bit: number): number {
  return bit ? 0 : 1;
}

export function hammingDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) throw new Error('Довжини векторів не співпадають.');
  let d = 0;
  for (let i = 0; i < a.length; i += 1) if (a[i] !== b[i]) d += 1;
  return d;
}

/** Binary combinations C(n, k) up to n ≤ 60 (safe in Number). */
export function comb(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  let result = 1;
  const upper = Math.min(k, n - k);
  for (let i = 1; i <= upper; i += 1) {
    result = (result * (n - upper + i)) / i;
  }
  return Math.round(result);
}
