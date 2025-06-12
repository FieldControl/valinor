import { Module } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ColumnsModule } from '../columns/columns.module';
import { AuthModule } from '../auth/auth.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [PrismaModule, ColumnsModule, AuthModule, EventsModule],
  controllers: [CardsController],
  providers: [CardsService],
})
export class CardsModule {}
