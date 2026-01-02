import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';

@Module({
  imports: [],
  controllers: [],
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class KanbanModule {}
