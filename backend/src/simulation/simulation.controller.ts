import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { RunSimulationDto } from './dto/run-simulation.dto';
import { SimulationService } from './simulation.service';

@UseGuards(JwtAccessGuard)
@Controller('simulation')
export class SimulationController {
  constructor(private readonly simulationService: SimulationService) {}

  @Post('run')
  run(@CurrentUser() user: { userId: string }, @Body() dto: RunSimulationDto) {
    return this.simulationService.run(user.userId, dto);
  }

  @Get('runs')
  list(@CurrentUser() user: { userId: string }) {
    return this.simulationService.listForUser(user.userId);
  }
}
