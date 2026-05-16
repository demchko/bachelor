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

const MAX_CYCLIC_BLOCK = 96;

@Injectable()
export class CodesService {
  /* ─── Cyclic IRB code ────────────────────────────────── */

  /** Structural parameters + matrices for UI (block length capped). */
  cyclicStructure(sequence: number[]) {
    const S = sequence.reduce((a, b) => a + b, 0);
    if (S > MAX_CYCLIC_BLOCK) {
      throw new BadRequestException(
        `Сума ІКВ S=${S} завелика для візуалізації (макс. ${MAX_CYCLIC_BLOCK}). Скоротіть елементи послідовності.`,
      );
    }
    try {
      const code = buildCyclicCode(sequence);
      return {
        blockLength: code.n,
        informationLength: code.k,
        redundancy: code.rParity,
        differenceSet: code.differenceSet,
        generatorMatrix: code.generator,
        parityCheckMatrix: code.parityCheck,
        informationColumns: code.informationColumns,
      };
    } catch (err) {
      throw new BadRequestException((err as Error).message);
    }
  }

  /** Monolithic code parameters from IRB length (n = |sequence|). */
  monolithicMeta(sequenceLength: number) {
    if (sequenceLength < 2) {
      throw new BadRequestException('Послідовність має містити щонайменше 2 елементи.');
    }
    const book = buildMonolithicCodebook(sequenceLength);
    const symbolWidth = Math.ceil(Math.log2(book.n + 1));
    return {
      blockLength: book.n,
      symbolWidth,
      codewords: book.codewords,
      capacitySymbols: book.n + 1,
    };
  }

  cyclicEncode(sequence: number[], data: string) {
    const S = sequence.reduce((a, b) => a + b, 0);
    if (S > MAX_CYCLIC_BLOCK) {
      throw new BadRequestException(
        `Сума ІКВ S=${S} завелика для обчислення (макс. ${MAX_CYCLIC_BLOCK}).`,
      );
    }
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
    const S = sequence.reduce((a, b) => a + b, 0);
    if (S > MAX_CYCLIC_BLOCK) {
      throw new BadRequestException(
        `Сума ІКВ S=${S} завелика для обчислення (макс. ${MAX_CYCLIC_BLOCK}).`,
      );
    }
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
