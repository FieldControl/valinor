import { Module } from '@nestjs/common';
import { CardService } from './card.service';
import { CardController } from './card.controller';
import { ColumnModule } from 'src/column/column.module';
import { ColumnService } from 'src/column/column.service';
import { PrismaModule } from '../prisma/prisma.module';
import { KanbanModule } from 'src/gateways/events/events.module';
import { AblyModule } from 'src/gateways/ably/ably.module';

@Module({
  imports: [ColumnModule, PrismaModule, KanbanModule, AblyModule],
  controllers: [CardController],
  providers: [CardService, ColumnService],
})
export class CardModule {}
