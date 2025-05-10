import { Module } from '@nestjs/common';
import { ColumnService } from './column.service';
import { ColumnResolver } from './column.resolver';
import { ColumnKanban } from './entities/column.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([ColumnKanban])],
  providers: [ColumnResolver, ColumnService],
})
export class ColumnModule {}
