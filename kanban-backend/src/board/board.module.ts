import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardColumn } from './board.entity';  // Certifique-se de que é BoardColumn
import { BoardService } from './board.service';
import { BoardController } from './board.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BoardColumn])],  // Alterado para BoardColumn
  providers: [BoardService],
  controllers: [BoardController],
  exports: [TypeOrmModule],
})
export class BoardModule {}
