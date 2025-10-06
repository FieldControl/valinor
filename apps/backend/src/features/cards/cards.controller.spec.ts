import { Test, TestingModule } from '@nestjs/testing';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

describe('CardsController', () => {
  let controller: CardsController;

  const mockCardsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByColumn: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    moveCard: jest.fn(),
    updatePositions: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CardsController],
      providers: [
        {
          provide: CardsService,
          useValue: mockCardsService,
        },
      ],
    }).compile();

    controller = module.get<CardsController>(CardsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new card', async () => {
      const createCardDto: CreateCardDto = {
        title: 'Test Card',
        description: 'Test Description',
        columnId: 1,
        color: '#3B82F6',
        priority: 'medium',
      };

      const mockCard = {
        id: 1,
        ...createCardDto,
        position: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCardsService.create.mockResolvedValue(mockCard);

      const result = await controller.create(createCardDto);

      expect(mockCardsService.create).toHaveBeenCalledWith(createCardDto);
      expect(result).toEqual(mockCard);
    });
  });

  describe('findAll', () => {
    it('should return all cards when no columnId query', async () => {
      const mockCards = [
        {
          id: 1,
          title: 'Card 1',
          columnId: 1,
          position: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          title: 'Card 2',
          columnId: 2,
          position: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockCardsService.findAll.mockResolvedValue(mockCards);

      const result = await controller.findAll();

      expect(mockCardsService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockCards);
    });

    it('should return cards by column when columnId query is provided', async () => {
      const columnId = '1';
      const mockCards = [
        {
          id: 1,
          title: 'Card 1',
          columnId: 1,
          position: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockCardsService.findByColumn.mockResolvedValue(mockCards);

      const result = await controller.findAll(columnId);

      expect(mockCardsService.findByColumn).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockCards);
    });
  });

  describe('findOne', () => {
    it('should return a card by id', async () => {
      const mockCard = {
        id: 1,
        title: 'Test Card',
        columnId: 1,
        position: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCardsService.findOne.mockResolvedValue(mockCard);

      const result = await controller.findOne(1);

      expect(mockCardsService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockCard);
    });
  });

  describe('update', () => {
    it('should update a card', async () => {
      const updateCardDto: UpdateCardDto = {
        title: 'Updated Card',
        description: 'Updated Description',
      };

      const mockUpdatedCard = {
        id: 1,
        ...updateCardDto,
        columnId: 1,
        position: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCardsService.update.mockResolvedValue(mockUpdatedCard);

      const result = await controller.update(1, updateCardDto);

      expect(mockCardsService.update).toHaveBeenCalledWith(1, updateCardDto);
      expect(result).toEqual(mockUpdatedCard);
    });
  });

  describe('remove', () => {
    it('should remove a card', async () => {
      mockCardsService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(1);

      expect(mockCardsService.remove).toHaveBeenCalledWith(1);
      expect(result).toBeUndefined();
    });
  });

  describe('moveCard', () => {
    it('should move a card to a different column and position', async () => {
      const cardId = 1;
      const moveData = {
        columnId: 2,
        position: 1,
      };

      const mockMovedCard = {
        id: 1,
        title: 'Test Card',
        columnId: 2,
        position: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCardsService.moveCard.mockResolvedValue(mockMovedCard);

      const result = await controller.moveCard(cardId, moveData);

      expect(mockCardsService.moveCard).toHaveBeenCalledWith(1, 2, 1);
      expect(result).toEqual(mockMovedCard);
    });
  });

  describe('updatePositions', () => {
    it('should update positions of multiple cards', async () => {
      const positionUpdates = [
        { id: 1, position: 1, columnId: 1 },
        { id: 2, position: 0, columnId: 1 },
        { id: 3, position: 2, columnId: 2 },
      ];

      const mockUpdatedCards = [
        { id: 1, title: 'Card 1', position: 1, columnId: 1 },
        { id: 2, title: 'Card 2', position: 0, columnId: 1 },
        { id: 3, title: 'Card 3', position: 2, columnId: 2 },
      ];

      mockCardsService.updatePositions.mockResolvedValue(mockUpdatedCards);

      const result = await controller.updatePositions(positionUpdates);

      expect(mockCardsService.updatePositions).toHaveBeenCalledWith(
        positionUpdates
      );
      expect(result).toEqual(mockUpdatedCards);
    });
  });
});
