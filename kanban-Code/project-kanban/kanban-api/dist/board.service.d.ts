import { PrismaService } from "./database/prisma.service";
export declare class BoardService {
    private readonly prismaService;
    constructor(prismaService: PrismaService);
    getBoard(): Promise<{
        id: number;
        name: string;
    }[]>;
}
