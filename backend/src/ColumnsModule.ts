// filepath: src/columns/columns.module.ts
import { Module } from '@nestjs/common';
import { ColumnsService } from './columns.service';
import { ColumnsController } from './columns.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ColumnsController],
  providers: [ColumnsService],
})
export class ColumnsModule {}