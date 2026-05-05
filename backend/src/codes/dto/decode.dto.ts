import { ArrayMaxSize, ArrayMinSize, IsArray, IsInt, IsOptional, IsString, Matches, Min } from 'class-validator';

export class DecodeDto {
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(20)
  @IsInt({ each: true })
  @Min(1, { each: true })
  sequence!: number[];

  @IsString()
  @Matches(/^[01]+$/, { message: 'received має містити лише символи 0 та 1.' })
  received!: string;

  @IsOptional()
  @IsString()
  @Matches(/^[01]+$/, { message: 'originalCodeword має містити лише символи 0 та 1.' })
  originalCodeword?: string;
}
