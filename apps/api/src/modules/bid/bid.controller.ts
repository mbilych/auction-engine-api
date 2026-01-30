import { Body, Controller, Post } from '@nestjs/common';
import { BidService } from './bid.service';
import { CreateBidDto } from './dto/create-bid.dto';

@Controller('bid')
export class BidController {
  constructor(private readonly bidService: BidService) {}

  @Post()
  async placeBid(@Body() data: CreateBidDto) {
    return this.bidService.placeBid(data.auctionId, data.userId, data.amount);
  }
}
