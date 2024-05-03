import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import * as path from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { UserEntity } from './entities/user.entity';
import { BoardEntity } from './entities/board.entity';
import { ColumnEntity } from './entities/column.entity';
import { CardEntity } from './entities/card.entity';
import { BoardController } from './controllers/board.controller';
import { BoardService } from './services/board.service';
import { ColumnController } from './controllers/column.controller';
import { ColumnService } from './services/column.service';
import { CardController } from './controllers/card.controller';
import { CardService } from './services/card.service';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { JwtModule } from '@nestjs/jwt';

dotenv.config();

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '60s'},
      }),
    }),
    TypeOrmModule.forFeature([UserEntity, BoardEntity, ColumnEntity, CardEntity]),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: +configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USERNAME'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        entities: [__dirname + '/../**/*.entity.{js,ts}'],
        synchronize: configService.get('DATABASE_SYNCHRONIZE') === 'true',
        migrations: [path.join(process.cwd(), 'migrations/*.{js,ts}')],
      }),
    }),
  ],
  controllers: [AppController, UserController, BoardController, ColumnController, CardController, AuthController],
  providers: [AppService, UserService, BoardService, ColumnService, CardService, AuthService],
})
export class AppModule {}