import { SwimlaneService } from './swimlane.service';
import { CreateSwimlaneDto } from './dto/create-swimlane.dto';
import { UpdateSwimlaneDto } from './dto/update-swimlane.dto';
import { PayloadRequest } from 'src/auth/auth/auth.guard';
import { ReordereSwimlaneDto } from './dto/reorder-swimlane.dto';
export declare class SwimlaneController {
    private readonly swimlaneService;
    constructor(swimlaneService: SwimlaneService);
    create(req: PayloadRequest, createSwimlaneDto: CreateSwimlaneDto): Promise<import("src/swimlane/entities/swimlane.entity").Swimlane>;
    updateOrder(req: PayloadRequest, reorderedSwimlanes: ReordereSwimlaneDto): Promise<boolean>;
    findAll(boardId: string, req: PayloadRequest): Promise<import("src/swimlane/entities/swimlane.entity").Swimlane[]>;
    update(id: string, updateSwimlaneDto: UpdateSwimlaneDto, req: PayloadRequest): Promise<import("typeorm").UpdateResult>;
    remove(id: string, req: PayloadRequest): Promise<import("typeorm").DeleteResult>;
}
