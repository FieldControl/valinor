import { Repository } from 'typeorm';
import { Card } from './entities/card.entity';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
export declare class CardsService {
    private cardRepository;
    constructor(cardRepository: Repository<Card>);
    create(createCardDto: CreateCardDto): Promise<Card>;
    findAll(): Promise<Card[]>;
    findOne(id: number): Promise<Card | null>;
    update(id: number, updateCardDto: UpdateCardDto): Promise<import("typeorm").UpdateResult>;
    remove(id: number): Promise<import("typeorm").DeleteResult>;
}
