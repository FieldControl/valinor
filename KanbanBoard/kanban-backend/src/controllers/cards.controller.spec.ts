import { Test, TestingModule } from '@nestjs/testing';
import { CardsController } from './cards.controller';
import { CardsService } from '../services/cards.service';

describe('CardsController', () => {
  let controller: CardsController;
  let service: CardsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CardsController],
      providers: [
        {
          provide: CardsService,
          useValue: {
            findAll: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            moveCard: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CardsController>(CardsController);
    service = module.get<CardsService>(CardsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all cards (findAll)', async () => {
    const mockCards = [{ 
      id: 1,
      title: 'Card 1',
      description: 'Desc 1',
      columnId: 1,
      column: { id: 1, title: 'Column 1', cards: [] }
    }];
    jest.spyOn(service, 'findAll').mockResolvedValue(mockCards);

    expect(await controller.findAll()).toEqual(mockCards);
  });

  it('should create a new card', async () => {
    const body = { title: 'Card 1', description: 'Desc 1', columnId: 1 };
    const mockCard = { id: 1, ...body, column: { id: 1, title: 'Column 1', cards: [] } };
    jest.spyOn(service, 'create').mockResolvedValue(mockCard);

    expect(await controller.create(body)).toEqual(mockCard);
  });

  it('should update a card', async () => {
    const id = 1;
    const body = { title: 'Updated Card', description: 'Updated Desc' };
    const mockUpdatedCard = { id, ...body, column: { id: 1, title: 'Column 1', cards: [] } };
    jest.spyOn(service, 'update').mockResolvedValue(mockUpdatedCard);

    expect(await controller.update(id, body)).toEqual(mockUpdatedCard);
  });

  it('should delete a card', async () => {
    const id = 1;
    const mockResult = { message: 'Card deleted successfully' };
    jest.spyOn(service, 'delete').mockResolvedValue(mockResult);

    expect(await controller.delete(id)).toEqual(mockResult);
  });
});
