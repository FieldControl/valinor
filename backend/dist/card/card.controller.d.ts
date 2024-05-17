import { CardService } from './card.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
export declare class CardController {
    private readonly cardService;
    constructor(cardService: CardService);
    create(createCardDto: CreateCardDto): Promise<import("./entities/card.entity").Card>;
    findAll(): Promise<import("./entities/card.entity").Card[]>;
    findOne(id: string): Promise<import("./entities/card.entity").Card>;
    update(id: string, updateCardDto: UpdateCardDto): Promise<import("./entities/card.entity").Card>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
