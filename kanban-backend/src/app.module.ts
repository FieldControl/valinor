import { Module } from '@nestjs/common';
import { BoardsModule } from './boards/boards.module';
import { PrismaModule } from './database/prisma.module';
import { ColumnsModule } from './columns/columns.module';
import { TasksModule } from './tasks/tasks.module';
import { AppController } from './app.controller';

@Module({
  controllers: [AppController],
  imports: [PrismaModule, BoardsModule, ColumnsModule, TasksModule],
})
export class AppModule {}
