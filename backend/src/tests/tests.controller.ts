import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { SubmitTestDto } from './dto/submit-test.dto';
import { TestsService } from './tests.service';

@UseGuards(JwtAccessGuard)
@Controller('tests')
export class TestsController {
  constructor(private readonly testsService: TestsService) {}

  @Get()
  bank() {
    return this.testsService.bank();
  }

  @Post('submit')
  submit(@CurrentUser() user: { userId: string }, @Body() dto: SubmitTestDto) {
    return this.testsService.submit(user.userId, dto);
  }

  @Get('attempts')
  attempts(@CurrentUser() user: { userId: string }) {
    return this.testsService.listAttempts(user.userId);
  }
}
