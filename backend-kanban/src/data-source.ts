import { DataSource } from 'typeorm';
import { KanbanColumn } from './entities/kanban-column.entity';


export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'seu_usuario',
  password: 'sua_senha',
  database: 'seu_banco',
  entities: [KanbanColumn], 
  synchronize: false,
  migrations: ['src/migrations/*.ts'],
});

