import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { StatsService } from './stats.service';

@UseGuards(JwtAccessGuard)
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('me')
  forCurrentUser(@CurrentUser() user: { userId: string }) {
    return this.statsService.forUser(user.userId);
  }
}
