import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class VariantsIrbDto {
  @IsInt()
  @Min(3)
  @Max(12)
  n!: number;

  @IsInt()
  @Min(1)
  @Max(6)
  r!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  max?: number;
}
