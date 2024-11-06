import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ColumnsController } from './columns.controller';
import { ColumnsService } from './columns.service';

@Module({
  controllers: [ColumnsController],
  providers: [ColumnsService],
  imports: [PrismaModule],
})
export class ColumnsModule {}
