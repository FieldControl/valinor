import { BoardService } from './board.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { PayloadRequest } from 'src/auth/auth/auth.guard';
export declare class BoardController {
    private readonly boardService;
    constructor(boardService: BoardService);
    create(createBoardDto: CreateBoardDto, req: PayloadRequest): Promise<import("src/board/entities/board.entity").Board>;
    findAll(req: PayloadRequest): Promise<import("src/board/entities/board.entity").Board[]>;
    findOne(id: string, req: PayloadRequest): Promise<import("src/board/entities/board.entity").Board>;
    update(id: string, req: PayloadRequest, updateBoardDto: UpdateBoardDto): Promise<import("typeorm").UpdateResult>;
    remove(id: string, req: PayloadRequest): Promise<import("typeorm").DeleteResult>;
}
