import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Column } from '../features/columns/entities/column.entity';
import { Card } from '../features/cards/entities/card.entity';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: 'kanban.db',
  entities: [Column, Card],
  synchronize: true,
  logging: true,
};
