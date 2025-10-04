import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Column } from '../columns/entities/column.entity';
import { Card } from '../cards/entities/card.entity';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: 'kanban.db',
  entities: [Column, Card],
  synchronize: true,
  logging: true,
};
