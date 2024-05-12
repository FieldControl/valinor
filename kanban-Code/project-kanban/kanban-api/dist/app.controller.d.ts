import { PrismaService } from './database/prisma.service';
import { CreateBoards } from './dtos/create-board';
export declare class AppController {
    private prisma;
    constructor(prisma: PrismaService);
    createBoard(body: CreateBoards): Promise<{
        board: {
            columns: {
                id: number;
                name: string;
                boardId: number;
            }[];
        } & {
            id: number;
            name: string;
        };
    }>;
}
