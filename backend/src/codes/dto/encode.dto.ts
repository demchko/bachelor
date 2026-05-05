import { ArrayMaxSize, ArrayMinSize, IsArray, IsInt, IsString, Matches, Min } from 'class-validator';

export class EncodeDto {
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(20)
  @IsInt({ each: true })
  @Min(1, { each: true })
  sequence!: number[];

  @IsString()
  @Matches(/^[01]+$/, { message: 'data має містити лише символи 0 та 1.' })
  data!: string;
}
