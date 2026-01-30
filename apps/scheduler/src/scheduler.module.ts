import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configSchema } from './config.schema';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule, BullRootModuleOptions } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auction } from '@app/api/modules/auction/auction.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      isGlobal: true,
      validationSchema: configSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),
    ScheduleModule.forRoot(),
    BullModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get('REDIS_HOST'),
          port: config.get('REDIS_PORT'),
          maxRetriesPerRequest: null,
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'SchedulerQueue',
    }),
  ],
  providers: [SchedulerService],
})
export class SchedulerModule {}
