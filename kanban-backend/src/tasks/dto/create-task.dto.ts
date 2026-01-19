import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TaskPriority } from '../task-priority.enum';

export class CreateTaskDto {
  @IsNotEmpty()
  title: string;

  @IsOptional()
  description?: string; 

  @IsString()
  status: string;

  @IsEnum(TaskPriority)
  priority: TaskPriority;
}
