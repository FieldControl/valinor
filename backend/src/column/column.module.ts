import { Module } from '@nestjs/common';
import { ColumnService } from './column.service';
import { ColumnController } from './column.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { KanbanModule } from 'src/gateways/events/events.module';
import { AblyModule } from 'src/gateways/ably/ably.module';

@Module({
  imports: [PrismaModule, KanbanModule, AblyModule],
  controllers: [ColumnController],
  providers: [ColumnService],
  exports: [ColumnService],
})
export class ColumnModule {}
