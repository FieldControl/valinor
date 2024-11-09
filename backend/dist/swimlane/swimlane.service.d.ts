import { CreateSwimlaneDto } from './dto/create-swimlane.dto';
import { UpdateSwimlaneDto } from './dto/update-swimlane.dto';
import { Swimlane } from './entities/swimlane.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { ReordereSwimlaneDto } from './dto/reorder-swimlane.dto';
export declare class SwimlaneService {
    private swimlaneRepository;
    private userService;
    constructor(swimlaneRepository: Repository<Swimlane>, userService: UserService);
    create(createSwimlaneDto: CreateSwimlaneDto, userId: number): Promise<Swimlane>;
    updateSwimlaneOrders(reorder: ReordereSwimlaneDto, userId: number): Promise<boolean>;
    hasAccessToSwimlane(swimlaneId: number, userId: number): Promise<boolean>;
    findAllByBoardId(boardId: number, userId: number): Promise<Swimlane[]>;
    update(id: number, userId: number, updateSwimlaneDto: UpdateSwimlaneDto): Promise<import("typeorm").UpdateResult>;
    remove(id: number, userId: number): Promise<import("typeorm").DeleteResult>;
}
