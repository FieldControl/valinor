import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { Card } from './entities/card.entity';
import { Repository } from 'typeorm';
import { SwimlaneService } from 'src/swimlane/swimlane.service';
import { UserService } from 'src/user/user.service';
import { ReorderedCardDto } from './dto/reorder-cards.dto';
export declare class CardService {
    private cardRepository;
    private swimlaneService;
    private userService;
    constructor(cardRepository: Repository<Card>, swimlaneService: SwimlaneService, userService: UserService);
    create(createCardDto: CreateCardDto, userId: number): Promise<Card>;
    updateCardOrdersAndSwimlanes(reorder: ReorderedCardDto, userId: number): Promise<boolean>;
    update(id: number, userId: number, updateCardDto: UpdateCardDto): Promise<import("typeorm").UpdateResult>;
    remove(id: number, userId: number): Promise<import("typeorm").DeleteResult>;
}
