import { DataSource } from 'typeorm';
import { Board } from "./board/entities/board.entity";
import { Card } from "./card/entities/card.entity";
import { Swimlane } from './swimlane/entities/swimlane.entity';
import { User } from "./user/entities/user.entity";

const AppDataSource = new DataSource({
  type: 'postgres', 
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '123456',
  database: 'field',
  entities: [Board, Card, Swimlane, User], 
  synchronize: true, 
});

AppDataSource.initialize()
  .catch((err) => {
    console.error('Error during Data Source initialization', err);
  });

export default AppDataSource;
