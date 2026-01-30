import { NestFactory } from '@nestjs/core';
import { SchedulerModule } from './scheduler.module';

async function bootstrap() {
  // Since Scheduler only runs @Cron jobs and adds them to Bull,
  // we don't need a full Microservice or HTTP server.
  // ApplicationContext is enough to trigger the ScheduleModule and Bull logic.
  await NestFactory.createApplicationContext(SchedulerModule);
  console.log('Scheduler is running and monitoring cron jobs...');
}
bootstrap();
