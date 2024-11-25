import { Test, TestingModule } from '@nestjs/testing';
import { CardsService } from './cards.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from '../entities/card.entity';
import { Column } from '../entities/column.entity';

describe('CardsService', () => {
  let service: CardsService;
  let cardRepository: Repository<Card>;
  let columnRepository: Repository<Column>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardsService,
        {
          provide: getRepositoryToken(Card),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Column),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<CardsService>(CardsService);
    cardRepository = module.get<Repository<Card>>(getRepositoryToken(Card));
    columnRepository = module.get<Repository<Column>>(getRepositoryToken(Column));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find all cards', async () => {
    const mockCards = [{
      id: 1,
      title: 'Card 1',
      description: 'Desc 1',
      column: { id: 1, title: 'Column 1', cards: [] }
    }];
    jest.spyOn(cardRepository, 'find').mockResolvedValue(mockCards);

    expect(await service.findAll()).toEqual(mockCards);
  });

  it('should create a new card', async () => {
    const mockColumn = { id: 1, title: 'Column 1' } as Column; // Mock da coluna existente
    const mockCard = { 
      id: 1, 
      title: 'Card 1', 
      description: 'Description 1', 
      column: mockColumn 
    } as Card; // Mock do card criado
  
    jest.spyOn(columnRepository, 'findOneBy').mockResolvedValue(mockColumn); // Mock do findOneBy para retornar a coluna
    jest.spyOn(cardRepository, 'create').mockReturnValue(mockCard); // Mock do create
    jest.spyOn(cardRepository, 'save').mockResolvedValue(mockCard); // Mock do save
  
    expect(await service.create('Card 1', 'Description 1', 1)).toEqual(mockCard); // Verifica o resultado
  });
  
});
