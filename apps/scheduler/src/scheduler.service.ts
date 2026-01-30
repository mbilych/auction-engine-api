import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(@InjectQueue('SchedulerQueue') private readonly queue: Queue) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async openAuction() {
    this.logger.log('Adding openAuction job to queue');
    return this.queue.add('openAuction', {});
  }

  @Cron('*/10 * * * * *') // Every 10 seconds
  async closeAuction() {
    this.logger.log('Adding closeAuction job to queue');
    return this.queue.add('closeAuction', {});
  }
}
