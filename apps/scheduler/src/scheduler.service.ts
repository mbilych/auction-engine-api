import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class SchedulerService {
  constructor(@InjectQueue('SchedulerQueue') private readonly queue: Queue) {}

  // TODO: closeAuction, openAuction
}
