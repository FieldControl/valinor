import { Module } from '@nestjs/common';
import { ColumnsService } from './columns.service';
import { ColumnsController } from './columns.controller';

@Module({
  providers: [ColumnsService],
  controllers: [ColumnsController]
})
export class ColumnsModule {}
