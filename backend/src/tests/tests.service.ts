import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitTestDto } from './dto/submit-test.dto';
import { QUESTION_BANK } from './core/question-bank';

@Injectable()
export class TestsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Returns the question bank without correct answers (for the user). */
  bank() {
    return {
      total: QUESTION_BANK.length,
      questions: QUESTION_BANK.map((q) => ({
        id: q.id,
        text: q.text,
        options: q.options,
      })),
    };
  }

  async submit(userId: string, dto: SubmitTestDto) {
    if (dto.answers.length !== QUESTION_BANK.length) {
      throw new BadRequestException(
        `Очікувано ${QUESTION_BANK.length} відповідей, отримано: ${dto.answers.length}.`,
      );
    }
    const byId = new Map(QUESTION_BANK.map((q) => [q.id, q]));

    const enriched = dto.answers.map((ans) => {
      const q = byId.get(ans.questionId);
      if (!q) {
        throw new BadRequestException(`Невідоме питання з id=${ans.questionId}.`);
      }
      const isCorrect = ans.optionIndex === q.correctIndex;
      return {
        questionId: ans.questionId,
        optionIndex: ans.optionIndex,
        isCorrect,
        correctOptionIndex: q.correctIndex,
        explanation: q.explanation,
      };
    });

    const correct = enriched.filter((a) => a.isCorrect).length;
    const total = QUESTION_BANK.length;
    const scorePct = Math.round((correct / total) * 1000) / 10;

    const attempt = await this.prisma.testAttempt.create({
      data: {
        userId,
        total,
        correct,
        scorePct,
        durationSec: dto.durationSec ?? null,
        answers: enriched as unknown as object,
      },
    });

    return {
      attemptId: attempt.id,
      total,
      correct,
      scorePct,
      answers: enriched,
    };
  }

  async listAttempts(userId: string) {
    const attempts = await this.prisma.testAttempt.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return attempts.map((a) => ({
      id: a.id,
      total: a.total,
      correct: a.correct,
      scorePct: a.scorePct,
      durationSec: a.durationSec,
      createdAt: a.createdAt.toISOString(),
    }));
  }
}
