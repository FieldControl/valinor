import { PrismaService } from '../../prisma.service.js';

import { Module } from '@nestjs/common';

import { BoardService } from './board.service.js';
import { BoardResolver } from './board.resolver.js';

@Module({
  providers: [PrismaService, BoardResolver, BoardService],
})
export class BoardModule {}
