import { Module } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { BoardsController } from './boards.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Board, BoardSchema } from './entities/board.entity';
import { ColumnsModule } from 'src/columns/columns.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Board.name, schema: BoardSchema }]),
    ColumnsModule],
  controllers: [BoardsController],
  providers: [BoardsService],
})
export class BoardsModule {}
