import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BasicEntity } from '../../shared/classes/basic-entity.class';
import { Auction } from '../auction/auction.entity';

@Entity({ name: 'auction_log' })
export class AuctionLog extends BasicEntity {
  @Column({ type: 'uuid' })
  auctionId: string;

  @Column({ type: 'varchar', length: 50 })
  type: string; // 'START', 'BID', 'END'

  @Column({ type: 'jsonb', nullable: true })
  payload: any;

  @ManyToOne(() => Auction)
  @JoinColumn({ name: 'auctionId' })
  auction: Auction;
}
