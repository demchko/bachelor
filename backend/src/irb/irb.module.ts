import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { IrbController } from './irb.controller';
import { IrbService } from './irb.service';

@Module({
  imports: [PrismaModule],
  controllers: [IrbController],
  providers: [IrbService],
  exports: [IrbService],
})
export class IrbModule {}
