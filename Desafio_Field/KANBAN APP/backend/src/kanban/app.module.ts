// backend/src/app.module.ts
import { Module } from '@nestjs/common';

export class KanbanModule {}

@Module({
  imports: [KanbanModule],
})
export class AppModule {}
