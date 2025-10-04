import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ColumnsService } from './columns.service';
import { ColumnsController } from './columns.controller';
import { Column } from './entities/column.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Column])],
  controllers: [ColumnsController],
  providers: [ColumnsService],
  exports: [ColumnsService],
})
export class ColumnsModule {}
