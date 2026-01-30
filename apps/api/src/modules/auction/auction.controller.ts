import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AuctionService } from './auction.service';
import { Auction } from './auction.entity';

@Controller('auction')
export class AuctionController {
  constructor(private readonly auctionService: AuctionService) {}

  @Get()
  async getAuctions(): Promise<Auction[]> {
    return this.auctionService.find({
      order: { createdAt: 'DESC' },
    });
  }

  @Get(':id')
  async getAuction(@Param('id') id: string): Promise<Auction> {
    return this.auctionService.findOne({
      where: { id },
      relations: ['bids'],
    });
  }

  @Post()
  async createAuction(@Body() data: Partial<Auction>): Promise<Auction> {
    return this.auctionService.create(data);
  }
}
