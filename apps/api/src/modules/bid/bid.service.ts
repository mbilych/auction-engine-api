import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BasicOrmService } from '../../shared/services/basic-orm.service';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Bid } from './bid.entity';
import { AuctionService } from '../auction/auction.service';
import { AuctionStatus } from '../../shared/enums/auction-status.enum';
import { Auction } from '../auction/auction.entity';
import { AuctionLog } from '../auction/auction-log.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class BidService extends BasicOrmService<Bid> {
  constructor(
    @InjectRepository(Bid)
    protected repository: Repository<Bid>,
    @InjectRepository(AuctionLog)
    private readonly auctionLogRepository: Repository<AuctionLog>,
    private readonly auctionService: AuctionService,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super(repository);
  }

  async placeBid(auctionId: string, userId: string, amount: number) {
    return this.dataSource.transaction(async (manager) => {
      const auctionRepository = manager.getRepository(Auction);
      const bidRepository = manager.getRepository(Bid);
      const logRepository = manager.getRepository(AuctionLog);

      const auction = await auctionRepository.findOne({
        where: { id: auctionId },
      });

      if (!auction) {
        throw new NotFoundException('Auction not found');
      }

      if (auction.status !== AuctionStatus.Active) {
        throw new BadRequestException('Auction is not active');
      }

      const minBid = Number(auction.currentPrice) + Number(auction.minStep);
      if (amount < minBid) {
        throw new BadRequestException(`Bid must be at least ${minBid}`);
      }

      // Sniping protection: extend by 30 seconds if bid is in last 30 seconds
      const SNIPE_THRESHOLD_MS = 30 * 1000;
      const EXTENSION_MS = 30 * 1000;
      const now = new Date();
      const timeRemaining = auction.endsAt.getTime() - now.getTime();

      if (timeRemaining < SNIPE_THRESHOLD_MS) {
        auction.endsAt = new Date(auction.endsAt.getTime() + EXTENSION_MS);
      }

      const bid = bidRepository.create({
        auctionId,
        userId,
        amount,
      });

      auction.currentPrice = amount;

      const savedBid = await bidRepository.save(bid);
      await auctionRepository.save(auction);

      // Audit Log
      await logRepository.save(
        logRepository.create({
          auctionId,
          type: 'BID',
          payload: { amount, userId, bidId: savedBid.id },
        }),
      );

      this.eventEmitter.emit('bid.placed', { 
        auctionId, 
        bid: savedBid,
        auctionEndsAt: auction.endsAt 
      });

      return savedBid;
    });
  }
}
