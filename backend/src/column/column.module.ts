import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ColumnService } from './column.service';
import { ColumnController } from '../column.controller';
import { Column } from './column.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Column])],
  providers: [ColumnService],
  controllers: [ColumnController],
})
export class ColumnModule {}
