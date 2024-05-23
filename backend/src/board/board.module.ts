import { Module } from '@nestjs/common';
import { BoardService } from './board.service';
import { BoardController } from './board.controller';

@Module({
  controllers: [BoardController],
  providers: [BoardService],
})
export class BoardModule {}
