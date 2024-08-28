import { Module } from '@nestjs/common';

import { PrismaModule } from './prisma/prisma.module';
import { ColumnsModule } from './columns/columns.module';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [PrismaModule, ColumnsModule, TasksModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
