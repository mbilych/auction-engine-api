import { Module, Global } from '@nestjs/common';
import { AuctionModule } from '../modules/auction/auction.module';
import { BidModule } from '../modules/bid/bid.module';
import { EventsModule } from '../modules/events/events.module';
import { QueuesModule } from '../modules/queues/queues.module';

const modules = [
  AuctionModule,
  BidModule,
  EventsModule,
  QueuesModule,
];
const providers = [];
const guards = [];
const services = [];

@Global()
@Module({
  imports: [...modules],
  providers: [...guards, ...providers, ...services],
  exports: [...modules, ...providers, ...services],
})
export class SharedModule {}
