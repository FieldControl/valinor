import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ColumnsController } from './columns.controller';
import { ColumnsService } from './columns.service';
import { ColumnEntity } from './column.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ColumnEntity]),
  ],
  controllers: [ColumnsController],
  providers: [ColumnsService],
  exports: [
    ColumnsService,
    TypeOrmModule,
  ],
})
export class ColumnsModule {}
