import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KanbanService } from './kanban.service';
import { CardEntity } from './entities/CardEntity';
import { KanbanResolver } from './graphql/resolvers/kanban.resolver';

// Importando o módulo TypeOrmModule para usar o TypeORM com o NestJS, KanbanService para lógica de negócios,
// ColumnEntity e CardEntity para as entidades do banco de dados, e KanbanResolver para resolver as queries e mutations GraphQL.
@Module({
  imports: [TypeOrmModule.forFeature([CardEntity])],
  providers: [KanbanService, KanbanResolver],
})
export class KanbanModule {}
