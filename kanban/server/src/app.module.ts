import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TaskModule } from './modules/task/task.module';
import { ColumnModule } from './modules/column/column.module';
import { BoardModule } from './modules/board/board.module';

@Module({
  imports: [TaskModule, ColumnModule, BoardModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
