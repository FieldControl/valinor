import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KanbanModule } from './kanban/kanban.module';
import { Kanban1Module } from './kanban1/kanban1.module';

@Module({
  imports: [KanbanModule, Kanban1Module],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
