import { ArrayMaxSize, ArrayMinSize, IsArray, IsBoolean, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class ValidateIrbDto {
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(20)
  @IsInt({ each: true })
  @Min(1, { each: true })
  sequence!: number[];

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
