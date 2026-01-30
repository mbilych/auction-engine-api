import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { SchedulerProcessor } from './scheduler.processor';
import { ActionService } from './action.service';
import { ActionProcessor } from './action.processor';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auction } from '../auction/auction.entity';
import { Bid } from '../bid/bid.entity';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Auction, Bid]),
    BullModule.registerQueue({
      name: 'SchedulerQueue',
    }),
    BullModule.registerQueue({
      name: 'ActionQueue',
    }),
    EventsModule,
  ],
  providers: [SchedulerProcessor, ActionProcessor, ActionService],
  exports: [ActionService],
})
export class QueuesModule {}
