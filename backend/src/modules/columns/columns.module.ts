
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { ColumnsController } from './columns.controller';
import { ColumnsService } from './columns.service';

@Module({
  imports: [DatabaseModule],
  providers: [ColumnsService],
  controllers: [ColumnsController],
  exports: [ColumnsService]
})
export class ColumnsModule { }
