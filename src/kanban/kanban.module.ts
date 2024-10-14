import { Module } from '@nestjs/common';
import { KanbanController } from './kanban.controller';
import { KanbanService } from './kanban.service';
import { KanbanEntity } from 'src/Entity/kanban.entity';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';

@Module({
  imports: [TypeOrmModule.forFeature([KanbanEntity])],
  controllers: [KanbanController],
  providers: [KanbanService]
})
export class KanbanModule {}
