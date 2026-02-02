import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { BidService } from './bid.service';
import { CreateBidDto } from './dto/create-bid.dto';

@Controller('bid')
export class BidController {
  constructor(private readonly bidService: BidService) {}

  @Post()
  @Throttle({
    bid: {
      limit: 15,
      ttl: 300000, // 5 minutes - user is banned for 5 min after exceeding 15 bids
    },
  })
  async placeBid(@Body() data: CreateBidDto) {
    return this.bidService.placeBid(data.auctionId, data.userId, data.amount);
  }
}
