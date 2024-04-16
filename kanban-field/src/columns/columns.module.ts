import { Module } from '@nestjs/common';
import { ColumnsService } from './columns.service';
import { ColumnsController } from './columns.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Column, ColumnSchema } from './entities/column.entity';

@Module({
  imports: [MongooseModule.forFeature([{ name: Column.name, schema: ColumnSchema }])],
  controllers: [ColumnsController],
  providers: [ColumnsService],
})
export class ColumnsModule {}
