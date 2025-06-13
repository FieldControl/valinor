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
    JwtModule.register({
      global: true,
      secret: 'secretKey',
      signOptions: { expiresIn: '3h' },
    }),
  ],
  controllers: [AppController, AuthController, BoardsController],
  providers: [AppService, AuthService, UserService, BoardsService],
})
export class AppModule { }
