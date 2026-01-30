import { Process, Processor } from '@nestjs/bull';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { Auction } from '../auction/auction.entity';
import { AuctionStatus } from '../../shared/enums/auction-status.enum';
import { ActionService } from './action.service';
import { EventsGateway } from '../events/events.gateway';
import { Logger } from '@nestjs/common';

@Processor('SchedulerQueue')
export class SchedulerProcessor {
  private readonly logger = new Logger(SchedulerProcessor.name);

  constructor(
    @InjectRepository(Auction)
    private readonly auctionRepository: Repository<Auction>,
    private readonly actionService: ActionService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  @Process('openAuction')
  async openAuction() {
    const now = new Date();
    const auctionsToOpen = await this.auctionRepository.find({
      where: {
        status: AuctionStatus.Created,
        startsAt: LessThanOrEqual(now),
      },
    });

    if (auctionsToOpen.length > 0) {
      for (const auction of auctionsToOpen) {
        this.logger.log(`Opening auction ${auction.id}`);
        auction.status = AuctionStatus.Active;
        await this.auctionRepository.save(auction);
        this.eventsGateway.broadcastAuctionStatus(
          auction.id,
          AuctionStatus.Active,
        );
        this.eventsGateway.broadcastAuctionListUpdate();
      }
    }
  }

  @Process('closeAuction')
  async closeAuction() {
    const now = new Date();

    // 1. Find auctions that should be CLOSED
    const auctionsToClose = await this.auctionRepository.find({
      where: {
        status: AuctionStatus.Active,
        endsAt: LessThanOrEqual(now),
      },
    });

    if (auctionsToClose.length > 0) {
      this.logger.log(`Closing ${auctionsToClose.length} auctions`);
      const auctionIds = auctionsToClose.map((a) => a.id);

      for (const auction of auctionsToClose) {
        auction.status = AuctionStatus.Finished;
        await this.auctionRepository.save(auction);
      }

      // Enqueue winner determination
      await this.actionService.enqueueAuctionClosed(auctionIds);
      this.eventsGateway.broadcastAuctionListUpdate();
    }

    // 2. Find auctions that have been 'Finished' for at least 90 seconds and RESET them
    // This is safer than Bull delayed jobs for this specific demo environment
    const RESET_THRESHOLD_MS = 90 * 1000;
    const resetTime = new Date(now.getTime() - RESET_THRESHOLD_MS);

    const auctionsToReset = await this.auctionRepository.find({
      where: {
        status: AuctionStatus.Finished,
        endsAt: LessThanOrEqual(resetTime),
      },
    });

    if (auctionsToReset.length > 0) {
      this.logger.log(
        `Resetting ${auctionsToReset.length} finished auctions to Created state`,
      );
      for (const auction of auctionsToReset) {
        this.logger.log(`Resetting auction slot: ${auction.id}`);

        // Cleanup
        await this.auctionRepository.query(
          'DELETE FROM "bid" WHERE "auctionId" = $1',
          [auction.id],
        );
        await this.auctionRepository.query(
          'DELETE FROM "auction_log" WHERE "auctionId" = $1',
          [auction.id],
        );

        // Prepare next round
        const cooldownSec = 30;
        const durationMin = Math.floor(Math.random() * 3) + 3; // 3-5 mins

        auction.status = AuctionStatus.Created;
        auction.currentPrice = auction.initialPrice;
        auction.winnerBidId = null;
        auction.winnerUserId = null;
        auction.startsAt = new Date(now.getTime() + cooldownSec * 1000);
        auction.endsAt = new Date(
          auction.startsAt.getTime() + durationMin * 60000,
        );
        auction.version = auction.version + 1;

        await this.auctionRepository.save(auction);
      }
      this.eventsGateway.broadcastAuctionListUpdate();
    }
  }
}
