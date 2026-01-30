import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auction } from '../auction/auction.entity';
import { AuctionStatus } from '../../shared/enums/auction-status.enum';
import { EventsGateway } from '../events/events.gateway';
import { Logger } from '@nestjs/common';

@Processor('ActionQueue')
export class ActionProcessor {
  private readonly logger = new Logger(ActionProcessor.name);

  constructor(
    @InjectRepository(Auction)
    private readonly auctionRepository: Repository<Auction>,
    private readonly eventsGateway: EventsGateway,
  ) {}

  @Process('auctionClosed')
  async auctionClosed(job: Job<{ auctionIds: string[] }>) {
    const { auctionIds } = job.data;

    for (const auctionId of auctionIds) {
      const auction = await this.auctionRepository.findOne({
        where: { id: auctionId },
        relations: ['bids'],
      });

      if (!auction) continue;

      this.logger.log(`Determining winner for auction: ${auction.id}`);

      let winnerBidId = null;
      let winnerUserId = null;
      if (auction.bids && auction.bids.length > 0) {
        const highestBid = auction.bids.reduce((prev, current) =>
          Number(prev.amount) > Number(current.amount) ? prev : current,
        );
        winnerBidId = highestBid.id;
        winnerUserId = highestBid.userId;
        auction.winnerBidId = winnerBidId;
        auction.winnerUserId = winnerUserId;
        await this.auctionRepository.save(auction);
        this.logger.log(
          `Winner for ${auction.id} is user ${winnerUserId} with bid ${winnerBidId}`,
        );
      }

      this.eventsGateway.broadcastAuctionStatus(
        auction.id,
        AuctionStatus.Finished,
        {
          winnerBidId: winnerBidId,
          winnerUserId: winnerUserId,
        },
      );
    }
  }
}
