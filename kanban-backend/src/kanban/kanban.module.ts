import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KanbanService } from './kanban.service';
import { CardEntity } from './entities/CardEntity';
import { KanbanResolver } from './graphql/resolvers/kanban.resolver';
import { KanbanGateway } from './gateway/kanban.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([CardEntity])],
  providers: [KanbanService, KanbanResolver, KanbanGateway],
})
export class KanbanModule {}
