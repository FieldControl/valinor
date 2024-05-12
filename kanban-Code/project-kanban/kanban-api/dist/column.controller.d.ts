import { ColumnService } from "./column.service";
export declare class ColumnController {
    private readonly columnService;
    constructor(columnService: ColumnService);
    getColumn(): Promise<{
        id: number;
        name: string;
        boardId: number;
    }[]>;
}
