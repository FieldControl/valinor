import { Module } from '@nestjs/common';
import { ColumnResolver } from './column.resolver';
import { ColumnService } from './column.service';

@Module({
  providers: [ColumnResolver, ColumnService]
})
export class ColumnModule {}
