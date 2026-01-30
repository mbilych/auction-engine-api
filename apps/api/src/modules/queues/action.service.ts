import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

@Injectable()
export class ActionService {
  constructor(@InjectQueue('ActionQueue') private readonly queue: Queue) {}

  enqueueAuctionClosed(auctionIds: string[]) {
    return this.queue.add('auctionClosed', { auctionIds });
  }
}
