import { Module } from '@nestjs/common';
import { BoardService } from './services/board.service';
import { ColumnService } from './services/column.service';
import { CardService } from './services/card.service';
import { BoardResolver } from './resolvers/board.resolver';
import { ColumnResolver } from './resolvers/column.resolver';
import { CardResolver } from './resolvers/card.resolver';

@Module({
  providers: [
    BoardService,
    ColumnService,
    CardService,
    BoardResolver,
    ColumnResolver,
    CardResolver,
  ],
  exports: [
    BoardService,
    ColumnService,
    CardService,
  ],
})
export class KanbanModule {} 