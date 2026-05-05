export interface CircularSumDto {
  start: number;
  length: number;
  elements: number[];
  sum: number;
}

export interface IrbDto {
  n: number;
  r: number;
  s: number;
  sequence: number[];
  isValid: boolean;
  circularSums: CircularSumDto[];
  coverage: number[];
  missing: number[];
  redundancyEffective?: number;
}

export interface IrbPropertiesDto {
  n: number;
  r: number;
  s: number;
  sequence: number[];
  totalSum: number;
  expectedSum: number;
  isValid: boolean;
  canonical: number[];
  reflection: number[];
  rotations: number[][];
  distinctRingSums: number;
  redundancyEffective: number;
  spread: number;
  bitsPerSymbol: number;
  capacityBits: number;
}

export interface IrbPresetDto {
  n: number;
  r: number;
  s: number;
  sequence: number[];
  isValid: boolean;
}

export interface GenerateIrbRequestDto {
  n: number;
  r: number;
  save?: boolean;
  label?: string;
}

export interface ValidateIrbRequestDto {
  sequence: number[];
  r: number;
  save?: boolean;
  label?: string;
}

export interface PropertiesIrbRequestDto {
  sequence: number[];
  r: number;
}

export interface VariantsIrbRequestDto {
  n: number;
  r: number;
  max?: number;
}

export interface IrbConfigDto extends IrbDto {
  id: string;
  source: 'generator' | 'manual' | 'preset';
  label: string | null;
  createdAt: string;
}
