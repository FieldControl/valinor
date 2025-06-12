import { DataSource } from 'typeorm';
import { Column } from './columns/columns.entity';
import { Card } from './cards/cards.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'seu_usuario',
  password: 'sua_senha',
  database: 'nome_db',
  entities: [Column, Card],
  migrations: ['dist/migrations/*.js'],
  synchronize: false,
  dropSchema: false,
  logging: false,
});
