import { Controller, Patch, Param, Body, UseGuards, ParseIntPipe, Request } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TaskStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

class UpdateTaskStatusDto {
  @IsEnum(TaskStatus)
  status: TaskStatus;
}

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTaskStatusDto,
    @Request() req: any,
  ) {
    const userId = req.user.userId;
    return this.tasksService.updateStatus(id, userId, dto.status);
  }
}
