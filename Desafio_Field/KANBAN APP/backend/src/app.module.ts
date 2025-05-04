// backend/src/app.module.ts
import { Module as NestModule } from '@nestjs/common';
import { KanbanModule } from './kanban/kanban.module';
import { KanbanController } from './kanban/kanban.controller'; 

@NestModule({
  imports: [KanbanModule],
})
export class AppModule {}

// backend/src/kanban/kanban.module.ts
// Removed duplicate declaration of KanbanModule
