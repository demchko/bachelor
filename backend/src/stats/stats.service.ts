import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QUESTION_BANK } from '../tests/core/question-bank';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async forUser(userId: string) {
    const [attempts, configs, runs, lastConfig, lastRun, lastAttempt] = await Promise.all([
      this.prisma.testAttempt.findMany({
        where: { userId },
        select: { scorePct: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      this.prisma.irbConfig.count({ where: { userId } }),
      this.prisma.simulationRun.count({ where: { userId } }),
      this.prisma.irbConfig.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
      this.prisma.simulationRun.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
      this.prisma.testAttempt.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
    ]);

    const bestScore = attempts.length
      ? Math.max(...attempts.map((a) => a.scorePct))
      : null;

    const lastDates = [lastConfig?.createdAt, lastRun?.createdAt, lastAttempt?.createdAt]
      .filter((d): d is Date => Boolean(d))
      .map((d) => d.getTime());
    const lastActivityAt = lastDates.length
      ? new Date(Math.max(...lastDates)).toISOString()
      : null;

    return {
      testsCompleted: attempts.length,
      testsAvailable: QUESTION_BANK.length,
      bestTestScorePct: bestScore,
      configsGenerated: configs,
      configsSaved: configs,
      simulationsRan: runs,
      lastActivityAt,
    };
  }
}
