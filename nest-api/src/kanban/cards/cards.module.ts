import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { ColumnTable } from '../columns/columns.entity';
import { ColumnsResolver } from '../columns/columns.resolver';
import { ColumnsService } from '../columns/columns.service';
import { Card } from './cards.entity';
import { CardsResolver } from './cards.resolver';
import { CardsService } from './cards.service';

@Module({
  imports: [TypeOrmModule.forFeature([Card, ColumnTable, User])],
  providers: [
    CardsService,
    CardsResolver,
    ColumnsService,
    UserService,
    ColumnsResolver,
  ],
})
export class CardsModule {}
