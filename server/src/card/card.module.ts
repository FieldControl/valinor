import { Module } from '@nestjs/common';
import { CardService } from './card.service.js';
import { CardResolver } from './card.resolver.js';
import { PrismaService } from '../../prisma.service.js';

@Module({
  providers: [PrismaService, CardResolver, CardService],
})
export class CardModule {}
