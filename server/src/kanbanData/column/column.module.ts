import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ColumnResolver } from './column.resolver';
import { ColumnService } from './column.service';
import { Column, ColumnSchema } from './column.schema';
import { TaskModule } from '../task/task.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Column.name, schema: ColumnSchema }]),
    TaskModule
  ],
  providers: [ColumnResolver, ColumnService],
  exports: [ColumnService],
})
export class ColumnModule {}