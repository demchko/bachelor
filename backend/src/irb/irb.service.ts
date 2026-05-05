import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  analyzeCoverage,
  circularSums,
  computeProperties,
  computeS,
  generateIrb,
  generateVariants,
  IrbProperties,
  isIrb,
  presetEntries,
} from './core/irb-math';

export interface IrbAnalysis {
  n: number;
  r: number;
  s: number;
  sequence: number[];
  isValid: boolean;
  circularSums: { start: number; length: number; elements: number[]; sum: number }[];
  coverage: number[];
  missing: number[];
  redundancyEffective: number;
}

@Injectable()
export class IrbService {
  constructor(private readonly prisma: PrismaService) {}

  /** Synthesizes an IRB for given (n, R) using known table + directed search. */
  async generate(
    userId: string,
    n: number,
    r: number,
    save: boolean,
    label?: string,
  ): Promise<IrbAnalysis & { id?: string }> {
    const expectedS = computeS(n, r);
    if (!Number.isFinite(expectedS)) {
      throw new BadRequestException(
        `Для n=${n}, R=${r} ІКВ не існує: n(n−1) не ділиться на R.`,
      );
    }

    let sequence: number[];
    try {
      const result = generateIrb(n, r, { useKnown: true, timeBudgetMs: 4000 });
      sequence = result.sequence;
    } catch (err) {
      throw new BadRequestException(
        (err as Error).message ??
          `Не вдалося синтезувати ІКВ(n=${n}, R=${r}). Спробуйте інші параметри.`,
      );
    }

    const analysis = this.analyze(sequence, r);
    let id: string | undefined;
    if (save) {
      const saved = await this.prisma.irbConfig.create({
        data: {
          userId,
          n: analysis.n,
          r: analysis.r,
          s: analysis.s,
          sequence: analysis.sequence,
          isValid: analysis.isValid,
          source: 'generator',
          label: label ?? null,
        },
      });
      id = saved.id;
    }
    return { ...analysis, id };
  }

  /** Validates a user-supplied sequence and optionally saves it. */
  async validate(
    userId: string,
    sequence: number[],
    r: number,
    save: boolean,
    label?: string,
  ): Promise<IrbAnalysis & { id?: string }> {
    if (sequence.some((v) => !Number.isInteger(v) || v < 1)) {
      throw new BadRequestException('Послідовність має містити лише натуральні числа ≥ 1.');
    }
    const analysis = this.analyze(sequence, r);

    let id: string | undefined;
    if (save) {
      const saved = await this.prisma.irbConfig.create({
        data: {
          userId,
          n: analysis.n,
          r: analysis.r,
          s: analysis.s,
          sequence: analysis.sequence,
          isValid: analysis.isValid,
          source: 'manual',
          label: label ?? null,
        },
      });
      id = saved.id;
    }
    return { ...analysis, id };
  }

  /** Rich mathematical properties: rotations, reflection, canonical form, etc. */
  properties(sequence: number[], r: number): IrbProperties {
    if (sequence.length < 2) {
      throw new BadRequestException('Послідовність має містити щонайменше 2 числа.');
    }
    if (sequence.some((v) => !Number.isInteger(v) || v < 1)) {
      throw new BadRequestException('Послідовність має містити лише натуральні числа ≥ 1.');
    }
    return computeProperties(sequence, r);
  }

  /** Multiple distinct (canonical) IRB sequences for given (n, R). */
  variants(n: number, r: number, max = 5): IrbAnalysis[] {
    const expectedS = computeS(n, r);
    if (!Number.isFinite(expectedS)) {
      throw new BadRequestException(
        `Для n=${n}, R=${r} ІКВ не існує: n(n−1) не ділиться на R.`,
      );
    }
    const seqs = generateVariants(n, r, max, 4000);
    return seqs.map((seq) => this.analyze(seq, r));
  }

  /** Catalogue of known IRB seeds (validated). */
  presets(): { n: number; r: number; s: number; sequence: number[]; isValid: boolean }[] {
    return presetEntries().map(({ n, r, sequence }) => {
      const expectedS = computeS(n, r);
      return {
        n,
        r,
        s: Number.isFinite(expectedS) ? expectedS : sequence.reduce((a, b) => a + b, 0),
        sequence,
        isValid: isIrb(sequence, r),
      };
    });
  }

  /** Returns saved configurations of the user (newest first). */
  async listForUser(userId: string) {
    const items = await this.prisma.irbConfig.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return items.map((item) => ({
      id: item.id,
      n: item.n,
      r: item.r,
      s: item.s,
      sequence: item.sequence,
      isValid: item.isValid,
      source: item.source,
      label: item.label,
      createdAt: item.createdAt.toISOString(),
    }));
  }

  /** Pure analysis without persistence — used by other modules too. */
  analyze(sequence: number[], r: number): IrbAnalysis {
    const n = sequence.length;
    if (n < 2) {
      throw new BadRequestException('Послідовність має містити щонайменше 2 числа.');
    }
    const report = analyzeCoverage(sequence, r);
    const sums = circularSums(sequence);
    const coverage: number[] = [];
    const upper = Math.max(report.s - 1, 0);
    for (let v = 1; v <= upper; v += 1) {
      if ((report.counts[v] ?? 0) > 0) coverage.push(v);
    }

    const expectedS = computeS(n, r);
    const s = Number.isFinite(expectedS) ? expectedS : sequence.reduce((a, b) => a + b, 0);

    return {
      n,
      r,
      s,
      sequence: [...sequence],
      isValid: report.isIrb,
      circularSums: sums,
      coverage,
      missing: report.missing,
      redundancyEffective: report.rEffective,
    };
  }
}
