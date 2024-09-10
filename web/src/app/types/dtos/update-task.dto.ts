import { CreateTaskDto } from './create-task.dto';

export interface UpdateTaskDto extends Partial<CreateTaskDto> {}
