import { Module } from '@nestjs/common';

import { PrismaModule } from './prisma/prisma.module';
import { ColumnsModule } from './columns/columns.module';

@Module({
  imports: [PrismaModule, ColumnsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
