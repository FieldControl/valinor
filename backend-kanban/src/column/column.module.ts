import { Module } from '@nestjs/common';
import { ColumnController } from './column.controller';

@Module({
  controllers: [ColumnController]
})
export class ColumnModule {}
