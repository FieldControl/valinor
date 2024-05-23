import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { BoardModule } from './board/board.module';
import { SwimlaneModule } from './swimlane/swimlane.module';
import { CardModule } from './card/card.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from './board/entities/board.entity';
import { Card } from './card/entities/card.entity';
import { Swimlane } from './swimlane/entities/swimlane.entity';
import { User } from './user/entities/user.entity';

@Module({
  imports: [
    UserModule,
    BoardModule,
    SwimlaneModule,
    CardModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'thales',
      password: 'password',
      database: 'kanban_fc',
      entities: [Board, Card, Swimlane, User],
      synchronize: process.env.ENV !== 'production',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
