import { Module } from '@nestjs/common';
import { SwimlaneService } from './swimlane.service';
import { SwimlaneController } from './swimlane.controller';

@Module({
  controllers: [SwimlaneController],
  providers: [SwimlaneService],
})
export class SwimlaneModule {}
