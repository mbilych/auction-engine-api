import { Module } from '@nestjs/common';
import { Auction } from './auction.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuctionController } from './auction.controller';
import { AuctionService } from './auction.service';

import { AuctionLog } from './auction-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Auction, AuctionLog])],
  controllers: [AuctionController],
  providers: [AuctionService],
  exports: [AuctionService],
})
export class AuctionModule {}
