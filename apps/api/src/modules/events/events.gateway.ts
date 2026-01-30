import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { EventPattern, Payload } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { AuctionLog } from '../auction/auction-log.entity';
import { Repository } from 'typeorm';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);

  constructor(
    @InjectRepository(AuctionLog)
    private readonly logRepository: Repository<AuctionLog>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_auction')
  handleJoinAuction(client: Socket, auctionId: string) {
    client.join(`auction_${auctionId}`);
    return { event: 'joined', data: auctionId };
  }

  @OnEvent('bid.placed')
  onBidPlaced(payload: { auctionId: string; bid: any }) {
    this.server.to(`auction_${payload.auctionId}`).emit('bid_placed', {
      ...payload.bid,
      serverTime: new Date(),
    });
  }

  @EventPattern('auction_started')
  async handleAuctionStarted(@Payload() data: { auctionId: string }) {
    this.logger.log(`Auction started event received: ${data.auctionId}`);

    await this.logRepository.save(
      this.logRepository.create({
        auctionId: data.auctionId,
        type: 'START',
      }),
    );

    this.server.to(`auction_${data.auctionId}`).emit('auction_status', {
      auctionId: data.auctionId,
      status: 'Active',
      serverTime: new Date(),
    });
    this.server.emit('auction_list_update');
  }

  @EventPattern('auction_finished')
  async handleAuctionFinished(
    @Payload() data: { auctionId: string; winnerBidId?: string },
  ) {
    this.logger.log(`Auction finished event received: ${data.auctionId}`);

    await this.logRepository.save(
      this.logRepository.create({
        auctionId: data.auctionId,
        type: 'END',
        payload: { winnerBidId: data.winnerBidId },
      }),
    );

    this.server.to(`auction_${data.auctionId}`).emit('auction_status', {
      auctionId: data.auctionId,
      status: 'Finished',
      winnerBidId: data.winnerBidId,
      serverTime: new Date(),
    });
    this.server.emit('auction_list_update');
  }

  broadcastAuctionListUpdate() {
    this.server.emit('auction_list_update');
  }

  broadcastAuctionStatus(auctionId: string, status: string, extra: any = {}) {
    this.server.to(`auction_${auctionId}`).emit('auction_status', {
      auctionId,
      status,
      ...extra,
      serverTime: new Date(),
    });
    this.broadcastAuctionListUpdate();
  }
}
