import { Module } from '@nestjs/common';
import { ColumnService } from './column.service';
import { ColumnResolver } from './column.resolver';

@Module({
  providers: [ColumnResolver, ColumnService],
})
export class ColumnModule {}
