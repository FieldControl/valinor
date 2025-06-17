import { PrismaService } from '../prisma/prisma.service';
import { TaskStatus } from '@prisma/client';
export declare class TasksService {
    private prisma;
    constructor(prisma: PrismaService);
    updateStatus(taskId: number, userId: number, status: TaskStatus): Promise<{
        id: number;
        description: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        assignedToId: number;
        cardId: number;
    }>;
}
