import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KanbanModule } from './kanban/kanban.module';

@Module({
  imports: [KanbanModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
