import { PrismaService } from "./database/prisma.service";
export declare class ColumnService {
    private readonly prismaService;
    constructor(prismaService: PrismaService);
    getColumn(): Promise<{
        id: number;
        name: string;
        boardId: number;
    }[]>;
}
