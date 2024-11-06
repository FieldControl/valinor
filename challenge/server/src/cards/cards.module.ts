import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';

@Module({
  controllers: [CardsController],
  providers: [CardsService],
  imports: [PrismaModule],
})
export class CardsModule {}
