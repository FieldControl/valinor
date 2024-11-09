import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { Repository } from 'typeorm';
import { Board } from './entities/board.entity';
import { UserService } from 'src/user/user.service';
export declare class BoardService {
    private boardRepository;
    private userService;
    constructor(boardRepository: Repository<Board>, userService: UserService);
    isUserAssociatedWithBoard(boardId: number, userId: number): Promise<boolean>;
    create(createBoardDto: CreateBoardDto, userId: number): Promise<Board>;
    findAllByUserId(userId: number): Promise<Board[]>;
    findOne(id: number, userId: number): Promise<Board>;
    update(id: number, userId: number, updateBoardDto: UpdateBoardDto): Promise<import("typeorm").UpdateResult>;
    remove(id: number, userId: number): Promise<import("typeorm").DeleteResult>;
}
