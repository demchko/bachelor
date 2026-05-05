import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SimulationController } from './simulation.controller';
import { SimulationService } from './simulation.service';

@Module({
  imports: [PrismaModule],
  controllers: [SimulationController],
  providers: [SimulationService],
  exports: [SimulationService],
})
export class SimulationModule {}
