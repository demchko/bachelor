import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { CodesService } from './codes.service';
import { DecodeDto } from './dto/decode.dto';
import { EfficiencyDto } from './dto/efficiency.dto';
import { EncodeDto } from './dto/encode.dto';
import { SequenceDto } from './dto/sequence.dto';

@UseGuards(JwtAccessGuard)
@Controller('codes')
export class CodesController {
  constructor(private readonly codesService: CodesService) {}

  @Post('cyclic/structure')
  cyclicStructure(@Body() dto: SequenceDto) {
    return this.codesService.cyclicStructure(dto.sequence);
  }

  @Post('monolithic/meta')
  monolithicMeta(@Body() dto: SequenceDto) {
    return this.codesService.monolithicMeta(dto.sequence.length);
  }

  /* Cyclic */

  @Post('cyclic/encode')
  cyclicEncode(@Body() dto: EncodeDto) {
    return this.codesService.cyclicEncode(dto.sequence, dto.data);
  }

  @Post('cyclic/decode')
  cyclicDecode(@Body() dto: DecodeDto) {
    return this.codesService.cyclicDecode(dto.sequence, dto.received, dto.originalCodeword);
  }

  /* Monolithic */

  @Post('monolithic/encode')
  monolithicEncode(@Body() dto: EncodeDto) {
    return this.codesService.monolithicEncode(dto.sequence, dto.data);
  }

  @Post('monolithic/decode')
  monolithicDecode(@Body() dto: DecodeDto) {
    return this.codesService.monolithicDecode(dto.sequence, dto.received, dto.originalCodeword);
  }

  /* Analytics */

  @Post('efficiency')
  efficiency(@Body() dto: EfficiencyDto) {
    return this.codesService.efficiency(dto.n, dto.r, dto.kind);
  }

  @Get('trapezoid')
  trapezoid(@Query('maxN') maxN?: string) {
    return this.codesService.trapezoidTable(maxN ? Number(maxN) : 11);
  }
}
