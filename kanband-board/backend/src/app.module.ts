import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { BoardModule } from './board/board.module';
import { SwimlaneModule } from './swimlane/swimlane.module';
import { CardModule } from './card/card.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Board } from './board/entities/board.entity';
import { Card } from './card/entities/card.entity';
import { Swimlane } from './swimlane/entities/swimlane.entity';
import { User } from './user/entities/user.entity';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/auth/auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [User, Board, Swimlane, Card],
      synchronize: process.env.ENV !== 'production',
    }),
    UserModule,
    BoardModule,
    SwimlaneModule,
    CardModule,
  
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, AuthGuard],
})
export class AppModule {}
