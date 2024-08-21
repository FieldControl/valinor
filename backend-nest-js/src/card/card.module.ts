//importação padrão na criação de aplicações NestJS.
import { Module } from '@nestjs/common';
import { CardService } from './card.service';
import { CardController } from './card.controller';

//importando Modulo para manipular o DataBase e Entidade referente ao endpoint
import { TypeOrmModule } from '@nestjs/typeorm';
import { Card } from './entities/card.entity';
import { ColumnModule } from 'src/column/column.module';
import { ColumnService } from 'src/column/column.service';
import { Columns } from 'src/column/entities/column.entity';
import { User } from 'src/user/entities/user.entity';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';

@Module({
  controllers: [CardController],
  providers: [CardService, ColumnService, UserService],
  imports: [TypeOrmModule.forFeature([Card, Columns, User]), ColumnModule, UserModule],
})
export class CardModule {}
