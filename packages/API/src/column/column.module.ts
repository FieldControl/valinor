import { Module } from '@nestjs/common';
import { ColumnController } from './column.controller';
import { ColumnService } from './column.service';
import { KnexModule } from '../knex.module';
import { ColumnRepository } from './column.repository';
import { CardRepository } from 'src/card/card.repository';

@Module({
  imports: [KnexModule],
  controllers: [ColumnController],
  providers: [ColumnService, ColumnRepository, CardRepository],
})
export class ColumnModule { }

