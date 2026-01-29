import { Column, Entity, OneToMany } from 'typeorm';
import { BasicEntity } from '../../shared/classes/basic-entity.class';
import { AuctionStatus } from '../../shared/enums/auction-status.enum';
import { Bid } from '../bid/bid.entity';

@Entity({ name: 'auction' })
export class Auction extends BasicEntity {
  @Column({ type: 'enum', enum: AuctionStatus, default: AuctionStatus.Created })
  status: AuctionStatus;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  thumbnail?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  currentPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  minStep: number;

  @Column({ type: 'timestamp' })
  endsAt: Date;

  @Column({ type: 'uuid', nullable: true })
  winnerBidId?: string;

  @Column({ type: 'int', default: 0 })
  version: number;

  @OneToMany(() => Bid, (bid) => bid.auction)
  bids: Bid[];
}
