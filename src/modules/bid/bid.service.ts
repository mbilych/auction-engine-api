import { Injectable } from '@nestjs/common';
import { BasicOrmService } from 'src/shared/services/basic-orm.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bid } from './bid.entity';

@Injectable()
export class BidService extends BasicOrmService<Bid> {
  constructor(
    @InjectRepository(Bid)
    protected repository: Repository<Bid>,
  ) {
    super(repository);
  }
}
