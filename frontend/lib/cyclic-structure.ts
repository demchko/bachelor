import type { CyclicStructureResult } from '@/lib/api';
import { buildCyclicCode } from '@/lib/codes/cyclic-code';

/** Same cap as Nest `CodesService.MAX_CYCLIC_BLOCK`. */
const MAX_CYCLIC_BLOCK = 96;

/**
 * Builds cyclic IRB structure locally (no HTTP). Matches `POST /codes/cyclic/structure` on the server.
 */
export function computeCyclicStructure(sequence: number[]): CyclicStructureResult | null {
  if (sequence.length < 2) return null;
  const S = sequence.reduce((a, b) => a + b, 0);
  if (S > MAX_CYCLIC_BLOCK) return null;
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
  } catch {
    return null;
  }
}
