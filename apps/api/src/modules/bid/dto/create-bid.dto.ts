import { IsNumber, IsPositive, IsUUID, Max } from 'class-validator';

export class CreateBidDto {
  @IsUUID()
  auctionId: string;

  @IsUUID()
  userId: string;

  @IsNumber()
  @IsPositive()
  @Max(99999999.99, { message: 'Bid amount is too large' })
  amount: number;
}
