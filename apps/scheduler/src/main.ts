import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SchedulerModule } from './scheduler.module';

async function bootstrap() {
  const configModule = await NestFactory.createApplicationContext(ConfigModule);
  const configService = configModule.get(ConfigService);

  const app = await NestFactory.createMicroservice(SchedulerModule, {
    transport: Transport.REDIS,
    options: {
      host: configService.get('REDIS_HOST'),
      port: configService.get('REDIS_PORT'),
    },
  });
  await app.listen();
}
bootstrap();
