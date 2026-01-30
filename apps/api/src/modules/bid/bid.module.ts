import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { AuctionModule } from '../auction/auction.module';
import { BidController } from './bid.controller';
import { Bid } from './bid.entity';
import { BidService } from './bid.service';
import { EventsModule } from '../events/events.module';

import { AuctionLog } from '../auction/auction-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bid, AuctionLog]),
    AuctionModule,
    EventsModule,
  ],
  controllers: [BidController],
  providers: [BidService],
  exports: [BidService],
})
export class BidModule {}
