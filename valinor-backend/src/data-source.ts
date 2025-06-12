import { DataSource } from 'typeorm';
import { Column } from './columns/columns.entity';
import { Card } from './cards/cards.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'penta',
  password: 'penta123',
  database: 'valinor_test',
  entities: [Column, Card],
  migrations: ['dist/migrations/*.js'],
  synchronize: false,
  dropSchema: false,
  logging: false,
});
