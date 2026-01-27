import { Module } from '@nestjs/common';
import { Auction } from './auction.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuctionController } from './auction.controller';
import { AuctionService } from './auction.service';

@Module({
  imports: [TypeOrmModule.forFeature([Auction])],
  controllers: [AuctionController],
  providers: [AuctionService],
  exports: [AuctionService],
})
export class AuctionModule {}
