export interface TestQuestionDto {
  id: number;
  text: string;
  options: string[];
}

export interface TestBankDto {
  total: number;
  questions: TestQuestionDto[];
}

export interface TestAnswerInputDto {
  questionId: number;
  optionIndex: number;
}

export interface TestSubmissionRequestDto {
  answers: TestAnswerInputDto[];
  durationSec?: number;
}

export interface TestAnswerResultDto {
  questionId: number;
  optionIndex: number;
  isCorrect: boolean;
  correctOptionIndex: number;
  explanation: string;
}

export interface TestSubmissionResponseDto {
  attemptId: string;
  total: number;
  correct: number;
  scorePct: number;
  answers: TestAnswerResultDto[];
}

export interface TestAttemptDto {
  id: string;
  total: number;
  correct: number;
  scorePct: number;
  durationSec: number | null;
  createdAt: string;
}
