import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Column } from './columns.entity';
import { ColumnsService } from './columns.service';
import { ColumnsResolver } from './columns.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Column])],
  providers: [ColumnsService, ColumnsResolver],
  exports: [ColumnsService],
})
export class ColumnsModule {}
