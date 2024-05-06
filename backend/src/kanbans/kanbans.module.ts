import { Module } from '@nestjs/common';
import { KanbansController } from './kanbans.controller';
import { KanbansService } from './kanbans.service';

@Module({
  controllers: [KanbansController],
  providers: [KanbansService]
})
export class KanbansModule {}
