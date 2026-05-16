/**
 * Client-side Monte Carlo sweep for /simulation chart.
 * Mirrors `backend/src/simulation/core/bsc-channel.ts` `buildSweepChart` so the UI
 * stays correct even when an older Nest image still returns the legacy 2%..30% grid
 * and RS≈0 everywhere.
 */

import type { CodeKind, SimulationChartPoint } from '@/lib/api';
import { fromBitArray, toBitArray } from '@/lib/codes/binary-utils';
import { buildCyclicCode, decodeCyclic, encodeCyclic } from '@/lib/codes/cyclic-code';
import { buildMonolithicCodebook, decodeMonolithic, encodeMonolithic } from '@/lib/codes/monolithic-code';

/** Same grid as backend `buildSweepChart` (percent labels via `Math.round(er * 10_000) / 100`). */
export const SWEEP_RAW_BSC_P = [
  0.002, 0.004, 0.006, 0.008, 0.01, 0.015, 0.02, 0.03, 0.05, 0.08, 0.12, 0.18, 0.25, 0.3,
] as const;

const SWEEP_SAMPLES = 280;

function randomBits(len: number): string {
  let s = '';
  for (let i = 0; i < len; i += 1) s += Math.random() < 0.5 ? '0' : '1';
  return s;
}

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

function monteBinary(blockLen: number, packets: number, p: number): number {
  let ok = 0;
  for (let i = 0; i < packets; i += 1) {
    const data = randomBits(blockLen);
    const { received } = bscNoise(data, p);
    if (received === data) ok += 1;
  }
  return ok / packets;
}

function monteCyclic(sequence: number[], packets: number, p: number): number {
  const code = buildCyclicCode(sequence);
  let recovered = 0;
  for (let i = 0; i < packets; i += 1) {
    const data = randomBits(code.k);
    const { codeword } = encodeCyclic(code, data);
    const { received } = bscNoise(codeword, p);
    const dec = decodeCyclic(code, received, codeword);
    if (dec.decoded === data && !dec.uncorrected) recovered += 1;
  }
  return recovered / packets;
}

function monteMonolithic(n: number, packets: number, p: number): number {
  const book = buildMonolithicCodebook(n);
  const symbolWidth = Math.ceil(Math.log2(book.n + 1));
  let recovered = 0;
  for (let i = 0; i < packets; i += 1) {
    const weight = Math.floor(Math.random() * (book.n + 1));
    const data = weight.toString(2).padStart(symbolWidth, '0');
    const codeword = encodeMonolithic(book, data);
    const { received } = bscNoise(codeword, p);
    const dec = decodeMonolithic(book, received, codeword);
    if (dec.decoded === data && !dec.uncorrected) recovered += 1;
  }
  return recovered / packets;
}

function binomialLogPmf(nn: number, k: number, prob: number): number {
  if (k < 0 || k > nn) return -Infinity;
  if (prob <= 0) return k === 0 ? 0 : -Infinity;
  if (prob >= 1) return k === nn ? 0 : -Infinity;
  let logC = 0;
  for (let i = 1; i <= k; i += 1) {
    logC += Math.log(nn - i + 1) - Math.log(i);
  }
  return logC + k * Math.log(prob) + (nn - k) * Math.log(1 - prob);
}

function logSumExp(xs: number[]): number {
  const m = Math.max(...xs);
  if (!Number.isFinite(m) || m === -Infinity) return -Infinity;
  let s = 0;
  for (const x of xs) {
    if (Number.isFinite(x)) s += Math.exp(x - m);
  }
  if (s <= 0) return -Infinity;
  return m + Math.log(s);
}

/** RS(255,191) analytical block success (same as Nest `runReedSolomonAnalytic`). */
export function reedSolomonBlockSuccess(p: number): number {
  const t = 32;
  const pByte = 1 - Math.pow(1 - p, 8);
  const logPmfs: number[] = [];
  for (let i = 0; i <= t; i += 1) {
    logPmfs.push(binomialLogPmf(255, i, pByte));
  }
  return Math.exp(logSumExp(logPmfs));
}

export function buildClientSimulationChart(opts: {
  sequence: number[];
  primary: CodeKind;
  compareBinary: boolean;
  compareReedSolomon: boolean;
}): SimulationChartPoint[] {
  const { sequence, primary, compareBinary, compareReedSolomon } = opts;
  const blockLen = Math.max(8, sequence.reduce((a, b) => a + b, 0));
  const monoN = sequence.length;

  return SWEEP_RAW_BSC_P.map((er) => {
    let primaryRate: number;
    if (primary === 'irb-cyclic') {
      primaryRate = monteCyclic(sequence, SWEEP_SAMPLES, er);
    } else if (primary === 'irb-monolithic') {
      primaryRate = monteMonolithic(monoN, SWEEP_SAMPLES, er);
    } else {
      primaryRate = monteBinary(blockLen, SWEEP_SAMPLES, er);
    }

    const point: SimulationChartPoint = {
      errorRate: Math.round(er * 10_000) / 100,
      irb: Math.round(primaryRate * 100),
    };
    if (compareBinary) {
      point.binary = Math.round(monteBinary(blockLen, SWEEP_SAMPLES, er) * 100);
    }
    if (compareReedSolomon) {
      point.reedSolomon = Math.round(reedSolomonBlockSuccess(er) * 100);
    }
    return point;
  });
}
