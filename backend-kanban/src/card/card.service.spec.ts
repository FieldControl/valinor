import {Test, TestingModule} from '@nestjs/testing';
import { CardsService } from './card.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from '../entities/card.entity';

describe('CardService', () => {
    let service: CardsService;
    let repository: Repository<Card>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers:[
                CardsService,  
                {
                    provide: getRepositoryToken(Card),
                    useClass: Repository,
                },
            ],
        }).compile();

        service = module.get<CardsService>(CardsService);
        repository = module.get<Repository<Card>>(getRepositoryToken(Card));
    });

    it('deve estar definido', () => {
        expect(service).toBeDefined();
    });
});