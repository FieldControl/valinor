import { Module, forwardRef } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { BoardsController } from './boards.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Board, BoardSchema } from './entities/board.entity';
import { ColumnsModule } from '../columns/columns.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    forwardRef(() => ColumnsModule),
    MongooseModule.forFeature([{ name: Board.name, schema: BoardSchema }]),
    forwardRef(() => UsersModule),
    ],
  controllers: [BoardsController],
  providers: [BoardsService],
  exports: [BoardsService]
})
export class BoardsModule {}
