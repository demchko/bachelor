import type { CodeKind } from './codes';

export interface SimulationRequestDto {
  sequence: number[];
  packets: number;
  errorProbability: number;
  codeKind: CodeKind;
  /** Compare with binary uncoded transmission. */
  compareBinary?: boolean;
  /** Compare with Reed-Solomon (255,191) analytical baseline. */
  compareReedSolomon?: boolean;
  save?: boolean;
}

export interface SimulationStatsDto {
  codeKind: CodeKind;
  packets: number;
  errorProbability: number;
  totalBits: number;
  bitErrors: number;
  successfulPackets: number;
  recoveredPackets: number;
  bitFlipRate: number;
  successRate: number;
}

export interface SimulationChartPointDto {
  errorRate: number;
  irb: number;
  binary?: number;
  reedSolomon?: number;
}

export interface SimulationResponseDto {
  primary: SimulationStatsDto;
  comparisons: SimulationStatsDto[];
  chart: SimulationChartPointDto[];
  delta: number;
  savedRunId?: string;
}

export interface SimulationRunDto {
  id: string;
  codeKind: CodeKind;
  irbSequence: number[];
  packets: number;
  errorProbability: number;
  totalBits: number;
  bitErrors: number;
  successfulPackets: number;
  recoveredPackets: number;
  bitFlipRate: number;
  successRate: number;
  createdAt: string;
}
