import { IsIn, IsInt, Max, Min } from 'class-validator';

export class EfficiencyDto {
  @IsInt()
  @Min(2)
  @Max(64)
  n!: number;

  @IsInt()
  @Min(1)
  @Max(10)
  r!: number;

  @IsIn(['monolithic', 'cyclic'])
  kind!: 'monolithic' | 'cyclic';
}
