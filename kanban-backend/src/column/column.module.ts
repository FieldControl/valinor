import { Module } from '@nestjs/common';
import { ColumnResolver } from './column.resolver';
import { ColumnService } from './column.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ColumnResolver, ColumnService],
})
export class ColumnModule {}
