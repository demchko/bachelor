import { IsBoolean, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class GenerateIrbDto {
  @IsInt()
  @Min(3)
  @Max(12)
  n!: number;

  @IsInt()
  @Min(1)
  @Max(6)
  r!: number;

  @IsOptional()
  @IsBoolean()
  save?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  label?: string;
}
