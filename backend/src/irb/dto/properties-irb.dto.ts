import { ArrayMaxSize, ArrayMinSize, IsArray, IsInt, Max, Min } from 'class-validator';

export class PropertiesIrbDto {
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
}
