import { Module } from '@nestjs/common';
import { ColumnService } from './column.service';
import { ColumnController } from './column.controller';
import { PrismaClient } from '@prisma/client';

@Module({
  controllers: [ColumnController],
  providers: [ColumnService, PrismaClient],
})
export class ColumnModule {}
