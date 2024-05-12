import { BoardService } from "./board.service";
export declare class BoardController {
    private readonly boardService;
    constructor(boardService: BoardService);
    getBoard(): Promise<{
        id: number;
        name: string;
    }[]>;
}
