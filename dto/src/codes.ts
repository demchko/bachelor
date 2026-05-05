export type CodeKind = 'irb-cyclic' | 'irb-monolithic' | 'binary' | 'reed-solomon';

export interface EncodeRequestDto {
  /** IRB sequence used as the underlying combinatorial structure. */
  sequence: number[];
  /** Bit string to encode (e.g. "10110"). */
  data: string;
}

export interface EncodeResponseDto {
  codeword: string;
  blockLength: number;
  dataLength: number;
  redundancy: number;
  generatorMatrix?: number[][];
}

export interface DecodeRequestDto {
  sequence: number[];
  /** Received (possibly noisy) codeword. */
  received: string;
  /** Original codeword for diagnostic comparison (optional). */
  originalCodeword?: string;
}

export interface DecodeResponseDto {
  decoded: string;
  corrected: string;
  errorPositions: number[];
  detectedErrors: number;
  correctedErrors: number;
  uncorrected: boolean;
}

export interface EfficiencyRequestDto {
  /** Code length n (bits). */
  n: number;
  /** Number of erroneous symbols r in a codeword. */
  r: number;
  /** Code class. */
  kind: 'monolithic' | 'cyclic';
}

export interface EfficiencyResponseDto {
  n: number;
  r: number;
  kind: 'monolithic' | 'cyclic';
  /** Total possible n-bit combinations. */
  total: number;
  /** N1 — combinations from which errors can be detected. */
  detectable: number;
  /** N2 — combinations from which errors can be corrected. */
  correctable: number;
  detectablePct: number;
  correctablePct: number;
}

export interface TrapezoidRowDto {
  n: number;
  coefficients: number[];
  sum: number;
  /** x(n) = n * sum — number of detectable error positions. */
  xn: number;
}

export interface TrapezoidResponseDto {
  rows: TrapezoidRowDto[];
}
