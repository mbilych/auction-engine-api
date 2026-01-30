import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuctionLog } from '../auction/auction-log.entity';
import { EventsGateway } from './events.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([AuctionLog])],
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class EventsModule {}
