import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ColumnsModule } from './columns/columns.module';
import { TasksModule } from './tasks/tasks.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [ColumnsModule, TasksModule, PrismaModule]
})
export class AppModule {}
