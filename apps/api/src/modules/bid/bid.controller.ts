import { Body, Controller, Post } from '@nestjs/common';
import { BidService } from './bid.service';

@Controller('bid')
export class BidController {
  constructor(private readonly bidService: BidService) {}

  @Post()
  async placeBid(
    @Body() data: { auctionId: string; userId: string; amount: number },
  ) {
    return this.bidService.placeBid(data.auctionId, data.userId, data.amount);
  }
}
