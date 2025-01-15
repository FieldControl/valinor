import { KanbanService } from './kanban.service';
export declare class KanbanController {
    private kanbanService;
    constructor(kanbanService: KanbanService);
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
    deleteBoard(id: string): Promise<{
        message: string;
    }>;
    getColumnsByBoardId(id: string): Promise<({
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
    createColumn(id: string, title: string): Promise<{
        id: string;
        title: string;
        createdAt: Date;
        updatedAt: Date;
        boardId: string;
    }>;
    updateColumn(id: string, title: string): Promise<{
        id: string;
        title: string;
        createdAt: Date;
        updatedAt: Date;
        boardId: string;
    }>;
    deleteColumn(id: string): Promise<void>;
    createCard(id: string, description: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        isCompleted: boolean;
        columnId: string;
    }>;
    getCardById(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        isCompleted: boolean;
        columnId: string;
    }>;
    updateCard(id: string, isCompleted: boolean): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        isCompleted: boolean;
        columnId: string;
    }>;
    deleteCard(id: string): Promise<void>;
}
