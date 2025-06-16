import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card-with-tasks.dto';
export declare class CardsController {
    private cardsService;
    constructor(cardsService: CardsService);
    create(dto: CreateCardDto, req: any): Promise<{
        tasks: {
            id: number;
            description: string;
            status: import(".prisma/client").$Enums.TaskStatus;
            assignedToId: number;
            cardId: number;
        }[];
    } & {
        id: number;
        title: string;
        memberId: number;
        sentByMember: boolean;
        leaderId: number;
    }>;
    getMyCards(req: any): Promise<{
        id: number;
        title: string;
        memberId: number;
        sentByMember: boolean;
        leaderId: number;
    }[]>;
}
