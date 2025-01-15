import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './database/prisma.service';
import { KanbanController } from './kanban/kanban.controller';
import { KanbanService } from './kanban/kanban.service';

@Module({
  imports: [],
  controllers: [AppController, KanbanController],
  providers: [AppService, PrismaService, KanbanService],
})
export class AppModule {}
