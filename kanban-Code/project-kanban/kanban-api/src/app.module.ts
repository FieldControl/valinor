import { Controller, Module } from '@nestjs/common';
import { PrismaService } from './database/prisma.service';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';
import { ColumnController } from './column.controller';
import { ColumnService } from './column.service';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';





@Module({
  imports: [],
  controllers: [BoardController,ColumnController,TaskController,AppController],
  providers: [PrismaService, BoardService, ColumnService,TaskService],
})
export class AppModule {}
