/** Tiny helpers for working with bit-strings (mirror of backend `codes/core/binary-utils.ts`). */

export function toBitArray(bits: string): number[] {
  if (!/^[01]+$/.test(bits)) {
    throw new Error('Бітовий рядок має містити лише символи 0 та 1.');
  }
  return Array.from(bits, (c) => (c === '1' ? 1 : 0));
}

export function fromBitArray(arr: number[]): string {
  return arr.map((b) => (b ? '1' : '0')).join('');
}

export function hammingDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) throw new Error('Довжини векторів не співпадають.');
  let d = 0;
  for (let i = 0; i < a.length; i += 1) if (a[i] !== b[i]) d += 1;
  return d;
}
