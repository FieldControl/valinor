import { DataSource } from 'typeorm';
import { User } from './user/entities/user.entity';
import { Board } from './boards/entities/board.entity';
import { Column } from './columns/entities/column.entity';
import { Task } from './tasks/entities/task.entity';

export const AppDataSource = new DataSource({
    type: 'sqlite',
    database: 'db.sqlite',
    entities: [User, Board, Column, Task],
    migrations: ['dist/migrations/*.js'],
    synchronize: false,
});