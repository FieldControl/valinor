import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { UserService } from './user/user.service';
import { User } from './user/entities/user.entity';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { BoardsController } from './boards/boards.controller';
import { BoardsService } from './boards/boards.service';
import { Board } from './boards/entities/board.entity';
import { ColumnController } from './columns/column.controller';
import { ColumnService } from './columns/column.service';
import { Column } from './columns/entities/column.entity';
import { TasksController } from './tasks/tasks.controller';
import { TasksService } from './tasks/tasks.service';
import { Task } from './tasks/entities/task.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
      migrations: ['dist/migrations/*.js'],
    }),
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([Board]),
    TypeOrmModule.forFeature([Column]),
    TypeOrmModule.forFeature([Task]),
    JwtModule.register({
      global: true,
      secret: 'secretKey',
      signOptions: { expiresIn: '3h' },
    }),
  ],
  controllers: [AppController, AuthController, BoardsController, ColumnController, TasksController],
  providers: [AppService, AuthService, UserService, BoardsService, ColumnService, TasksService],
})
export class AppModule { }
