import { Module, Global } from '@nestjs/common';
import { AuctionModule } from 'src/modules/auction/auction.module';
import { BidModule } from 'src/modules/bid/bid.module';

const modules = [AuctionModule, BidModule];
const providers = [];
const guards = [];
const services = [];

@Global()
@Module({
  imports: [...modules],
  providers: [...guards, ...providers, ...services],
  exports: [...modules, ...providers, ...services],
})
export class SharedModule {}
