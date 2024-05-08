import { Module } from '@nestjs/common';
import { BoardService } from './board.service';
import { BoardController } from './board.controller';
import { PrismaClient } from '@prisma/client';

@Module({
  controllers: [BoardController],
  providers: [BoardService, PrismaClient],
})
export class BoardModule {}
