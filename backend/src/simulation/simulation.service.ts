import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RunSimulationDto } from './dto/run-simulation.dto';
import { buildSweepChart, simulate, SimulatedCode, SimulationStats } from './core/bsc-channel';

@Injectable()
export class SimulationService {
  constructor(private readonly prisma: PrismaService) {}

  async run(userId: string, dto: RunSimulationDto) {
    let primary: SimulationStats;
    try {
      primary = simulate(dto.codeKind, dto.sequence, dto.packets, dto.errorProbability);
    } catch (err) {
      throw new BadRequestException((err as Error).message);
    }

    const comparisons: SimulationStats[] = [];
    const compareKinds: SimulatedCode[] = [];
    if (dto.compareBinary) compareKinds.push('binary');
    if (dto.compareReedSolomon) compareKinds.push('reed-solomon');
    for (const kind of compareKinds) {
      comparisons.push(simulate(kind, dto.sequence, dto.packets, dto.errorProbability));
    }

    const chart = buildSweepChart(
      dto.codeKind,
      dto.sequence,
      Boolean(dto.compareBinary),
      Boolean(dto.compareReedSolomon),
    );

    // Delta vs binary baseline at the simulated error rate.
    const baselineRate = comparisons.find((c) => c.codeKind === 'binary')?.successRate ?? 0.8;
    const delta = Math.round((primary.successRate - baselineRate) * 1000) / 10;

    let savedRunId: string | undefined;
    if (dto.save) {
      const saved = await this.prisma.simulationRun.create({
        data: {
          userId,
          codeKind: primary.codeKind,
          irbSequence: dto.sequence,
          packets: primary.packets,
          errorProbability: primary.errorProbability,
          totalBits: primary.totalBits,
          bitErrors: primary.bitErrors,
          successfulPackets: primary.successfulPackets,
          recoveredPackets: primary.recoveredPackets,
          bitFlipRate: primary.bitFlipRate,
          successRate: primary.successRate,
          comparisons: comparisons as unknown as object,
        },
      });
      savedRunId = saved.id;
    }

    return {
      primary,
      comparisons,
      chart,
      delta,
      savedRunId,
    };
  }

  async listForUser(userId: string) {
    const items = await this.prisma.simulationRun.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
    return items.map((item) => ({
      id: item.id,
      codeKind: item.codeKind,
      irbSequence: item.irbSequence,
      packets: item.packets,
      errorProbability: item.errorProbability,
      totalBits: item.totalBits,
      bitErrors: item.bitErrors,
      successfulPackets: item.successfulPackets,
      recoveredPackets: item.recoveredPackets,
      bitFlipRate: item.bitFlipRate,
      successRate: item.successRate,
      createdAt: item.createdAt.toISOString(),
    }));
  }
}
