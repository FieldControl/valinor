import { Module } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service'; // Verifique se o caminho está correto
import { KanbanController } from './kanban.controller';
import { KanbanService } from './kanban.service';
import { KanbanResolver } from './kanban.resolver';

@Module({
  controllers: [KanbanController],
  providers: [KanbanService, KanbanResolver, PrismaService],
})
export class KanbanModule {}
