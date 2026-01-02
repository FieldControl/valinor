import { Module } from '@nestjs/common';
import { AblyGateway } from './ably.gateway';

@Module({
  providers: [AblyGateway],
  exports: [AblyGateway],
})
export class AblyModule {}
