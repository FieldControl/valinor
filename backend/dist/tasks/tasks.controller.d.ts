import { TasksService } from './tasks.service';
import { TaskStatus } from '@prisma/client';
declare class UpdateTaskStatusDto {
    status: TaskStatus;
}
export declare class TasksController {
    private tasksService;
    constructor(tasksService: TasksService);
    updateStatus(id: number, dto: UpdateTaskStatusDto, req: any): Promise<{
        id: number;
        description: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        cardId: number;
        assignedToId: number;
    }>;
}
export {};
