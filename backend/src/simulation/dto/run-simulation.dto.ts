import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export class RunSimulationDto {
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(20)
  @IsInt({ each: true })
  @Min(1, { each: true })
  sequence!: number[];

  @IsInt()
  @Min(1)
  @Max(50000)
  packets!: number;

  @IsNumber()
  @Min(0)
  @Max(0.5)
  errorProbability!: number;

  @IsIn(['irb-cyclic', 'irb-monolithic', 'binary', 'reed-solomon'])
  codeKind!: 'irb-cyclic' | 'irb-monolithic' | 'binary' | 'reed-solomon';

  @IsOptional()
  @IsBoolean()
  compareBinary?: boolean;

  @IsOptional()
  @IsBoolean()
  compareReedSolomon?: boolean;

  @IsOptional()
  @IsBoolean()
  save?: boolean;
}
