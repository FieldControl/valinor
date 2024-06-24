import { TaskService } from '@application/services/task.service';
import { AuthGuard } from '@guard//auth.guard';
import { Module } from '@nestjs/common';
import { TaskResolver } from '@resolvers/task.resolver';
import { AuthModule } from './auth.module';

@Module({
  imports: [AuthModule],
  providers: [TaskResolver, TaskService, AuthGuard],
})
export class TaskModule {}
