/**
 * Binary symmetric channel (BSC) and Monte-Carlo simulation utilities.
 *
 * The simulator transmits `packets` random data blocks through a BSC with
 * crossover probability `p`, applies the chosen channel code (encode → noise →
 * decode), and aggregates statistics consistent with the IRB study (article 1):
 *   - bit-flip rate (per-bit error rate),
 *   - successful packet rate (full-decode success),
 *   - recovered packet rate (decoder produced original message after correction).
 */

import {
  buildCyclicCode,
  decodeCyclic,
  encodeCyclic,
} from '../../codes/core/cyclic-code';
import {
  buildMonolithicCodebook,
  decodeMonolithic,
  encodeMonolithic,
} from '../../codes/core/monolithic-code';
import { fromBitArray, toBitArray } from '../../codes/core/binary-utils';

export type SimulatedCode = 'irb-cyclic' | 'irb-monolithic' | 'binary' | 'reed-solomon';

export interface SimulationStats {
  codeKind: SimulatedCode;
  packets: number;
  errorProbability: number;
  totalBits: number;
  bitErrors: number;
  successfulPackets: number;
  recoveredPackets: number;
  bitFlipRate: number;
  successRate: number;
}

/** Generates a random data block of given length. */
function randomBits(len: number): string {
  let s = '';
  for (let i = 0; i < len; i += 1) s += Math.random() < 0.5 ? '0' : '1';
  return s;
}

/** Applies BSC noise to a codeword (returns received word + bit-error count). */
function bscNoise(codeword: string, p: number): { received: string; errors: number } {
  const arr = toBitArray(codeword);
  let errors = 0;
  for (let i = 0; i < arr.length; i += 1) {
    if (Math.random() < p) {
      arr[i] ^= 1;
      errors += 1;
    }
  }
  return { received: fromBitArray(arr), errors };
}

/* ─── Code-specific runners ─────────────────────────────────── */

function runIrbCyclic(sequence: number[], packets: number, p: number): SimulationStats {
  const code = buildCyclicCode(sequence);
  let bitErrors = 0;
  let successfulPackets = 0;
  let recoveredPackets = 0;
  let totalBits = 0;

  for (let i = 0; i < packets; i += 1) {
    const data = randomBits(code.k);
    const { codeword } = encodeCyclic(code, data);
    const { received, errors } = bscNoise(codeword, p);
    bitErrors += errors;
    totalBits += codeword.length;

    const dec = decodeCyclic(code, received, codeword);
    if (received === codeword) successfulPackets += 1;
    if (dec.decoded === data && !dec.uncorrected) recoveredPackets += 1;
  }

  return {
    codeKind: 'irb-cyclic',
    packets,
    errorProbability: p,
    totalBits,
    bitErrors,
    successfulPackets,
    recoveredPackets,
    bitFlipRate: totalBits > 0 ? bitErrors / totalBits : 0,
    successRate: packets > 0 ? recoveredPackets / packets : 0,
  };
}

function runIrbMonolithic(sequence: number[], packets: number, p: number): SimulationStats {
  const book = buildMonolithicCodebook(sequence.length);
  const symbolWidth = Math.ceil(Math.log2(book.n + 1));
  let bitErrors = 0;
  let successfulPackets = 0;
  let recoveredPackets = 0;
  let totalBits = 0;

  for (let i = 0; i < packets; i += 1) {
    // Generate random allowed symbol (weight in 0..n).
    const weight = Math.floor(Math.random() * (book.n + 1));
    const data = weight
      .toString(2)
      .padStart(symbolWidth, '0');
    const codeword = encodeMonolithic(book, data);
    const { received, errors } = bscNoise(codeword, p);
    bitErrors += errors;
    totalBits += codeword.length;

    const dec = decodeMonolithic(book, received, codeword);
    if (received === codeword) successfulPackets += 1;
    if (dec.decoded === data && !dec.uncorrected) recoveredPackets += 1;
  }

  return {
    codeKind: 'irb-monolithic',
    packets,
    errorProbability: p,
    totalBits,
    bitErrors,
    successfulPackets,
    recoveredPackets,
    bitFlipRate: totalBits > 0 ? bitErrors / totalBits : 0,
    successRate: packets > 0 ? recoveredPackets / packets : 0,
  };
}

/** Plain binary transmission with no error correction. */
function runBinary(blockLen: number, packets: number, p: number): SimulationStats {
  let bitErrors = 0;
  let successfulPackets = 0;
  for (let i = 0; i < packets; i += 1) {
    const data = randomBits(blockLen);
    const { received, errors } = bscNoise(data, p);
    bitErrors += errors;
    if (received === data) successfulPackets += 1;
  }
  return {
    codeKind: 'binary',
    packets,
    errorProbability: p,
    totalBits: packets * blockLen,
    bitErrors,
    successfulPackets,
    recoveredPackets: successfulPackets,
    bitFlipRate: packets > 0 ? bitErrors / (packets * blockLen) : 0,
    successRate: packets > 0 ? successfulPackets / packets : 0,
  };
}

/**
 * Reed-Solomon (255, 223) over GF(2^8) — analytical estimate.
 * Implementing GF(256) RS in full is out of scope for this scaffold;
 * we use a Gilbert-Varshamov style upper bound on packet success rate:
 *   P_success ≈ Σ_{i=0..t} C(n_b, i) p^i (1-p)^{n_b - i}
 * where n_b = 255 bytes ≈ 2040 bits and t = 16 byte-errors corrected.
 */
function runReedSolomonAnalytic(packets: number, p: number): SimulationStats {
  const blockLen = 255 * 8;
  const t = 16; // RS(255, 223) corrects up to 16 byte errors per block
  // Approximate byte-error probability via 1 - (1-p)^8.
  const pByte = 1 - Math.pow(1 - p, 8);
  // Probability of ≤ t byte errors (sum of binomial PMF).
  let pSuccess = 0;
  for (let i = 0; i <= t; i += 1) {
    pSuccess += binomialPmf(255, i, pByte);
  }
  const successfulPackets = Math.round(packets * pSuccess);
  const totalBits = packets * blockLen;
  const bitErrors = Math.round(totalBits * p);
  return {
    codeKind: 'reed-solomon',
    packets,
    errorProbability: p,
    totalBits,
    bitErrors,
    successfulPackets,
    recoveredPackets: successfulPackets,
    bitFlipRate: totalBits > 0 ? bitErrors / totalBits : 0,
    successRate: pSuccess,
  };
}

function binomialPmf(n: number, k: number, p: number): number {
  if (k < 0 || k > n) return 0;
  if (p === 0) return k === 0 ? 1 : 0;
  if (p === 1) return k === n ? 1 : 0;
  let logC = 0;
  for (let i = 1; i <= k; i += 1) {
    logC += Math.log(n - i + 1) - Math.log(i);
  }
  return Math.exp(logC + k * Math.log(p) + (n - k) * Math.log(1 - p));
}

/* ─── Public API ──────────────────────────────────────────── */

export function simulate(
  codeKind: SimulatedCode,
  sequence: number[],
  packets: number,
  errorProbability: number,
): SimulationStats {
  if (packets <= 0 || packets > 50_000) {
    throw new Error('packets має бути в межах 1..50000.');
  }
  if (errorProbability < 0 || errorProbability > 0.5) {
    throw new Error('errorProbability має бути в [0, 0.5].');
  }
  switch (codeKind) {
    case 'irb-cyclic':
      return runIrbCyclic(sequence, packets, errorProbability);
    case 'irb-monolithic':
      return runIrbMonolithic(sequence, packets, errorProbability);
    case 'binary': {
      const len = Math.max(8, sequence.reduce((a, b) => a + b, 0));
      return runBinary(len, packets, errorProbability);
    }
    case 'reed-solomon':
      return runReedSolomonAnalytic(packets, errorProbability);
    default:
      throw new Error(`Unknown code kind: ${codeKind}`);
  }
}

/** Builds error-rate sweep used by the chart on /simulation. */
export function buildSweepChart(
  primary: SimulatedCode,
  sequence: number[],
  compareBinary: boolean,
  compareReedSolomon: boolean,
): { errorRate: number; irb: number; binary?: number; reedSolomon?: number }[] {
  const errorRates = [0.02, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3];
  const samples = 500;
  return errorRates.map((er) => {
    const irb = simulate(primary, sequence, samples, er).successRate * 100;
    const point: { errorRate: number; irb: number; binary?: number; reedSolomon?: number } = {
      errorRate: Math.round(er * 100),
      irb: Math.round(irb),
    };
    if (compareBinary) {
      point.binary = Math.round(simulate('binary', sequence, samples, er).successRate * 100);
    }
    if (compareReedSolomon) {
      point.reedSolomon = Math.round(simulate('reed-solomon', sequence, samples, er).successRate * 100);
    }
    return point;
  });
}
