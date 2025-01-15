import { PrismaService } from 'src/database/prisma.service';
export declare class KanbanService {
    private prisma;
    constructor(prisma: PrismaService);
    createBoard(title: string): Promise<{
        id: string;
        title: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getBoards(): Promise<{
        id: string;
        title: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getBoard(id: string): Promise<{
        id: string;
        title: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateBoard(id: string, title: string): Promise<{
        id: string;
        title: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteBoard(id: string): Promise<void>;
    getColumnsByBoardId(boardId: string): Promise<({
        cards: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string;
            isCompleted: boolean;
            columnId: string;
        }[];
    } & {
        id: string;
        title: string;
        createdAt: Date;
        updatedAt: Date;
        boardId: string;
    })[]>;
    createColumn(boardId: string, title: string): Promise<{
        id: string;
        title: string;
        createdAt: Date;
        updatedAt: Date;
        boardId: string;
    }>;
    updateColumn(columnId: string, title: string): Promise<{
        id: string;
        title: string;
        createdAt: Date;
        updatedAt: Date;
        boardId: string;
    }>;
    deleteColumn(columnId: string): Promise<void>;
    createCard(columnId: string, description: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        isCompleted: boolean;
        columnId: string;
    }>;
    getCardById(cardId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        isCompleted: boolean;
        columnId: string;
    }>;
    updateCard(cardId: string, isCompleted: boolean): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        isCompleted: boolean;
        columnId: string;
    }>;
    deleteCard(cardId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        isCompleted: boolean;
        columnId: string;
    }>;
}
