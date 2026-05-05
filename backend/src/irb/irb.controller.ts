import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { GenerateIrbDto } from './dto/generate-irb.dto';
import { PropertiesIrbDto } from './dto/properties-irb.dto';
import { ValidateIrbDto } from './dto/validate-irb.dto';
import { VariantsIrbDto } from './dto/variants-irb.dto';
import { IrbService } from './irb.service';
import { PrismaService } from '../prisma/prisma.service';

@UseGuards(JwtAccessGuard)
@Controller('irb')
export class IrbController {
  constructor(
    private readonly irbService: IrbService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('generate')
  generate(
    @CurrentUser() user: { userId: string },
    @Body() dto: GenerateIrbDto,
  ) {
    return this.irbService.generate(
      user.userId,
      dto.n,
      dto.r,
      dto.save ?? false,
      dto.label,
    );
  }

  @Post('validate')
  validate(
    @CurrentUser() user: { userId: string },
    @Body() dto: ValidateIrbDto,
  ) {
    return this.irbService.validate(
      user.userId,
      dto.sequence,
      dto.r,
      dto.save ?? false,
      dto.label,
    );
  }

  @Post('properties')
  properties(@Body() dto: PropertiesIrbDto) {
    return this.irbService.properties(dto.sequence, dto.r);
  }

  @Post('variants')
  variants(@Body() dto: VariantsIrbDto) {
    return this.irbService.variants(dto.n, dto.r, dto.max ?? 5);
  }

  @Get('presets')
  presets() {
    return this.irbService.presets();
  }

  @Get('configs')
  list(@CurrentUser() user: { userId: string }) {
    return this.irbService.listForUser(user.userId);
  }

  @Delete('configs/:id')
  async remove(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    await this.prisma.irbConfig.deleteMany({
      where: { id, userId: user.userId },
    });
    return { message: 'Конфігурацію видалено.' };
  }
}
