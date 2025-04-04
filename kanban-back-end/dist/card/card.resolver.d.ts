import { Card } from './card.model';
import { CardService } from './card.service';
import { ColumnService } from '../column/column.service';
export declare class CardResolver {
    private cardService;
    private columnService;
    constructor(cardService: CardService, columnService: ColumnService);
    createCard(columnId: string, title: string, description: string): Card;
}
