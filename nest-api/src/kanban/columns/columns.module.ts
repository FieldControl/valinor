import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ColumnTable } from './columns.entity';
import { ColumnsResolver } from './columns.resolver';
import { ColumnsService } from './columns.service';

@Module({
  imports: [TypeOrmModule.forFeature([ColumnTable])],
  providers: [ColumnsService, ColumnsResolver],
})
export class ColumnsModule {}
