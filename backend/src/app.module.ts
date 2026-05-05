import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { CodesModule } from './codes/codes.module';
import { IrbModule } from './irb/irb.module';
import { PrismaModule } from './prisma/prisma.module';
import { SimulationModule } from './simulation/simulation.module';
import { StatsModule } from './stats/stats.module';
import { TestsModule } from './tests/tests.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 60,
      },
    ]),
    PrismaModule,
    UsersModule,
    AuthModule,
    IrbModule,
    CodesModule,
    SimulationModule,
    TestsModule,
    StatsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
