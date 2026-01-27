import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { BidController } from './bid.controller';
import { Bid } from './bid.entity';
import { BidService } from './bid.service';

@Module({
  imports: [TypeOrmModule.forFeature([Bid])],
  controllers: [BidController],
  providers: [BidService],
  exports: [BidService],
})
export class BidModule {}
