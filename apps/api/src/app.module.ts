import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './ormconfig';
import { configSchema } from './config/config.shema';
import { SharedModule } from './shared/shared.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import Redis from 'ioredis';

@Module({
  imports: [
    SharedModule,
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const redisUrl = config.get('REDIS_URL');
        return {
          redis: redisUrl
            ? redisUrl
            : {
                host: config.get('REDIS_HOST'),
                port: config.get('REDIS_PORT'),
              },
          maxRetriesPerRequest: null,
        };
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'cdn'),
      serveRoot: '/cdn',
    }),
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      isGlobal: true,
      validationSchema: configSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),
    TypeOrmModule.forRoot({
      ...dataSourceOptions,
      synchronize: false,
      migrations: [],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const redisUrl = config.get('REDIS_URL');
        const redisClient = redisUrl
          ? new Redis(redisUrl)
          : new Redis({
              host: config.get('REDIS_HOST'),
              port: config.get('REDIS_PORT'),
            });

        return {
          throttlers: [
            {
              name: 'bid',
              ttl: 300000, // 5 minutes ban duration
              limit: 15, // 15 bids per TTL window
            },
          ],
          storage: new ThrottlerStorageRedisService(redisClient),
        };
      },
    }),
  ],
})
export class AppModule {}
