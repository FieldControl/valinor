import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasksModule } from './tasks/tasks.module';
import { PrismaModule } from './prisma/prisma.module';
import { BoardsModule } from './boards/boards.module';
import { ColumnsModule } from './columns/columns.module';

@Module({
  imports: [PrismaModule, BoardsModule, ColumnsModule, TasksModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}