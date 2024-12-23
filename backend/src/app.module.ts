import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './tasks/task.entity';
import { TaskModule } from './tasks/tasks.module';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'PoRtaluppi11',
      database: 'kanban_db',
      entities: [Task],
      synchronize: true, 
    }),    
    TaskModule,
  ],
})
export class AppModule {}
