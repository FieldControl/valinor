// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Board } from './entities/board.entity';
import { ColumnEntity } from './entities/column.entity';
import { Card } from './entities/card.entity';
import { User } from './entities/user.entity';
import { AuthModule } from './auth/auth.module';
import { BoardModule } from './board/board.module';
import { ColumnModule } from './column/column.module';
import { CardModule } from './card/card.module';
import { BoardMembersModule } from './board-members/board-members.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      entities: [Board, ColumnEntity, Card, User],
      synchronize: true,
    }),
    AuthModule,
    BoardModule,
    ColumnModule,
    CardModule,
    BoardMembersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
