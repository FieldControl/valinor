import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ColumnsModule } from './columns/columns.module';
import { CardsModule } from './cards/cards.module';
import { BoardsModule } from './boards/boards.module';

@Module({
  imports: [PrismaModule, BoardsModule, ColumnsModule, CardsModule]
})
export class AppModule {}
