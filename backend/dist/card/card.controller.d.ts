import { CardService } from './card.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { PayloadRequest } from 'src/auth/auth/auth.guard';
import { ReorderedCardDto } from './dto/reorder-cards.dto';
export declare class CardController {
    private readonly cardService;
    constructor(cardService: CardService);
    create(createCardDto: CreateCardDto, req: PayloadRequest): Promise<import("src/card/entities/card.entity").Card>;
    updateOrder(reorderCards: ReorderedCardDto, req: PayloadRequest): Promise<boolean>;
    update(id: string, req: PayloadRequest, updateCardDto: UpdateCardDto): Promise<import("typeorm").UpdateResult>;
    remove(id: string, req: PayloadRequest): Promise<import("typeorm").DeleteResult>;
}
