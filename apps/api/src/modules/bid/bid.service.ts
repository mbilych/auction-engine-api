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
    const MAX_RETRIES = 3;
    let attempt = 0;

    while (attempt < MAX_RETRIES) {
      try {
        return await this.dataSource.transaction(async (manager) => {
          // Timeout lock to prevent indefinite waiting (2 seconds)
          await manager.query("SET LOCAL lock_timeout = '2000'");

          const auctionRepository = manager.getRepository(Auction);
          const bidRepository = manager.getRepository(Bid);
          const logRepository = manager.getRepository(AuctionLog);

          const auction = await auctionRepository.findOne({
            where: { id: auctionId },
            lock: { mode: 'pessimistic_write' }, // ⚠️ Pessimistic Lock
          });

          if (!auction) {
            throw new NotFoundException('Auction not found');
          }

          if (auction.status !== AuctionStatus.Active) {
            throw new BadRequestException('Auction is not active');
          }

          // ⚠️ Idempotency Check
          if (
            Number(auction.currentPrice) === amount &&
            auction.winnerUserId === userId
          ) {
            const existingBid = await bidRepository.findOne({
              where: { auctionId, userId, amount },
            });
            if (existingBid) return existingBid;
          }

          const minBid = Number(auction.currentPrice) + Number(auction.minStep);
          if (amount < minBid) {
            throw new BadRequestException(
              `Bid amount ${amount} is too low. Minimum required: ${minBid}`,
            );
          }

          const increment = amount - Number(auction.currentPrice);
          const step = Number(auction.minStep);
          const remainder = increment % step;

          const isMultipleOfStep =
            Math.abs(remainder / step) < 0.01 ||
            Math.abs(1 - remainder / step) < 0.01;

          if (!isMultipleOfStep) {
            throw new BadRequestException(
              `Bid increment must be a multiple of ${step}`,
            );
          }

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

          const savedBid = await bidRepository.save(bid);

          // Update High Bidder Info
          auction.currentPrice = amount;
          auction.winnerBidId = savedBid.id;
          auction.winnerUserId = userId;

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
            auctionEndsAt: auction.endsAt,
          });

          return savedBid;
        });
      } catch (error: any) {
        // ⚠️ Retry Policy
        const isLockError =
          error.code === '55P03' || // lock_not_available
          error.code === '40P01'; // deadlock_detected

        if (isLockError && attempt < MAX_RETRIES - 1) {
          attempt++;
          // Exponential backoff: 50ms, 100ms, 200ms
          await new Promise((resolve) =>
            setTimeout(resolve, 50 * Math.pow(2, attempt)),
          );
          continue;
        }
        throw error;
      }
    }
  }
}
