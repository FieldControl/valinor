import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KanbanService } from './kanban/kanban.service';
import { PrismaModule } from './prisma/prisma.module';
import { KanbanModule } from './kanban/kanban.module';

@Module({
  imports: [PrismaModule, KanbanModule],
  controllers: [AppController],
  providers: [AppService, KanbanService],
})
export class AppModule {}
