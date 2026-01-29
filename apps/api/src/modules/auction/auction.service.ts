import { Injectable } from '@nestjs/common';
import { BasicOrmService } from 'src/shared/services/basic-orm.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auction } from './auction.entity';

@Injectable()
export class AuctionService extends BasicOrmService<Auction> {
  constructor(
    @InjectRepository(Auction)
    protected repository: Repository<Auction>,
  ) {
    super(repository);
  }
}
