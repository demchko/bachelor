import { BadRequestException, Injectable } from '@nestjs/common';
import { buildCyclicCode, decodeCyclic, encodeCyclic } from './core/cyclic-code';
import {
  buildMonolithicCodebook,
  decodeMonolithic,
  efficiencyCyclic,
  efficiencyMonolithic,
  encodeMonolithic,
  trapezoid,
} from './core/monolithic-code';

@Injectable()
export class CodesService {
  /* ─── Cyclic IRB code ────────────────────────────────── */

  cyclicEncode(sequence: number[], data: string) {
    try {
      const code = buildCyclicCode(sequence);
      const result = encodeCyclic(code, data);
      return {
        ...result,
        redundancy: code.rParity,
        generatorMatrix: code.generator,
        parityCheckMatrix: code.parityCheck,
      };
    } catch (err) {
      throw new BadRequestException((err as Error).message);
    }
  }

  cyclicDecode(sequence: number[], received: string, originalCodeword?: string) {
    try {
      const code = buildCyclicCode(sequence);
      return decodeCyclic(code, received, originalCodeword);
    } catch (err) {
      throw new BadRequestException((err as Error).message);
    }
  }

  /* ─── Monolithic IRB code ────────────────────────────── */

  monolithicEncode(sequence: number[], data: string) {
    try {
      const book = buildMonolithicCodebook(sequence.length);
      const codeword = encodeMonolithic(book, data);
      return {
        codeword,
        blockLength: book.n,
        dataLength: data.length,
        symbolWidth: Math.ceil(Math.log2(book.n + 1)),
        codebook: book.codewords,
      };
    } catch (err) {
      throw new BadRequestException((err as Error).message);
    }
  }

  monolithicDecode(sequence: number[], received: string, originalCodeword?: string) {
    try {
      const book = buildMonolithicCodebook(sequence.length);
      return decodeMonolithic(book, received, originalCodeword);
    } catch (err) {
      throw new BadRequestException((err as Error).message);
    }
  }

  /* ─── Efficiency analytics ───────────────────────────── */

  efficiency(n: number, r: number, kind: 'monolithic' | 'cyclic') {
    if (kind === 'monolithic') return efficiencyMonolithic(n, r);
    return efficiencyCyclic(n, r);
  }

  trapezoidTable(maxN: number) {
    const safe = Math.min(Math.max(maxN, 4), 25);
    return { rows: trapezoid(safe) };
  }
}
