import { ArrayMinSize, IsArray, IsInt, IsOptional, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class TestAnswerDto {
  @IsInt()
  @Min(1)
  questionId!: number;

  @IsInt()
  @Min(0)
  optionIndex!: number;
}

export class SubmitTestDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => TestAnswerDto)
  answers!: TestAnswerDto[];

  @IsOptional()
  @IsInt()
  @Min(0)
  durationSec?: number;
}
