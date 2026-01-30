import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BasicEntity } from '../../shared/classes/basic-entity.class';
import { Auction } from '../auction/auction.entity';
import { ColumnNumericTransformer } from '../../shared/transformers/numeric.transformer';

@Entity({ name: 'bid' })
export class Bid extends BasicEntity {
  @Column({ type: 'uuid' })
  userId: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  amount: number;

  @Column({ type: 'uuid' })
  auctionId: string;

  @ManyToOne(() => Auction, (auction) => auction.bids)
  @JoinColumn({ name: 'auctionId' })
  auction: Auction;
}
