import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { CardsService } from './cards.service';
import { Card } from './entities/card.entity';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { ColumnsService } from '../columns/columns.service';

describe('CardsService', () => {
  let service: CardsService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockColumnsService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardsService,
        {
          provide: getRepositoryToken(Card),
          useValue: mockRepository,
        },
        {
          provide: ColumnsService,
          useValue: mockColumnsService,
        },
      ],
    }).compile();

    service = module.get<CardsService>(CardsService);
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

      const mockColumn = { id: 1, title: 'Test Column' };
      const mockCard = {
        id: 1,
        ...createCardDto,
        position: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockColumnsService.findOne.mockResolvedValue(mockColumn);
      mockRepository.create.mockReturnValue(mockCard);
      mockRepository.save.mockResolvedValue(mockCard);

      const result = await service.create(createCardDto);

      expect(mockColumnsService.findOne).toHaveBeenCalledWith(1);
      expect(mockRepository.create).toHaveBeenCalledWith(createCardDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockCard);
      expect(result).toEqual(mockCard);
    });
  });

  describe('findAll', () => {
    it('should return all cards with relations', async () => {
      const mockCards = [
        {
          id: 1,
          title: 'Card 1',
          position: 0,
          column: { id: 1, title: 'Column 1' },
        },
        {
          id: 2,
          title: 'Card 2',
          position: 1,
          column: { id: 1, title: 'Column 1' },
        },
      ];

      mockRepository.find.mockResolvedValue(mockCards);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith({
        relations: ['column'],
        order: { position: 'ASC', createdAt: 'ASC' },
      });
      expect(result).toEqual(mockCards);
    });
  });

  describe('findByColumn', () => {
    it('should return cards by column id', async () => {
      const columnId = 1;
      const mockCards = [
        {
          id: 1,
          title: 'Card 1',
          columnId: 1,
          column: { id: 1, title: 'Column 1' },
        },
      ];

      mockRepository.find.mockResolvedValue(mockCards);

      const result = await service.findByColumn(columnId);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { columnId: 1 },
        relations: ['column'],
        order: { position: 'ASC', createdAt: 'ASC' },
      });
      expect(result).toEqual(mockCards);
    });
  });

  describe('findOne', () => {
    it('should return a card by id', async () => {
      const mockCard = {
        id: 1,
        title: 'Test Card',
        position: 0,
        columnId: 1,
        column: { id: 1, title: 'Column 1' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(mockCard);

      const result = await service.findOne(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['column'],
      });
      expect(result).toEqual(mockCard);
    });

    it('should throw NotFoundException when card not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(
        new NotFoundException('Card with ID 999 not found')
      );
    });
  });

  describe('update', () => {
    it('should update a card', async () => {
      const existingCard = {
        id: 1,
        title: 'Old Title',
        description: 'Old Description',
        columnId: 1,
        position: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updateCardDto: UpdateCardDto = {
        title: 'New Title',
        description: 'New Description',
      };

      const updatedCard = {
        ...existingCard,
        ...updateCardDto,
      };

      mockRepository.findOne.mockResolvedValue(existingCard);
      mockRepository.save.mockResolvedValue(updatedCard);

      const result = await service.update(1, updateCardDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['column'],
      });
      expect(mockRepository.save).toHaveBeenCalledWith(updatedCard);
      expect(result).toEqual(updatedCard);
    });

    it('should validate new column when changing columnId', async () => {
      const existingCard = {
        id: 1,
        title: 'Test Card',
        columnId: 1,
        position: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updateCardDto: UpdateCardDto = {
        columnId: 2,
      };

      const mockNewColumn = { id: 2, title: 'New Column' };
      const updatedCard = { ...existingCard, columnId: 2 };

      mockRepository.findOne.mockResolvedValue(existingCard);
      mockColumnsService.findOne.mockResolvedValue(mockNewColumn);
      mockRepository.save.mockResolvedValue(updatedCard);

      const result = await service.update(1, updateCardDto);

      expect(mockColumnsService.findOne).toHaveBeenCalledWith(2);
      expect(result).toEqual(updatedCard);
    });
  });

  describe('remove', () => {
    it('should remove a card', async () => {
      const mockCard = {
        id: 1,
        title: 'Test Card',
        position: 0,
        columnId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(mockCard);
      mockRepository.remove.mockResolvedValue(mockCard);

      await service.remove(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['column'],
      });
      expect(mockRepository.remove).toHaveBeenCalledWith(mockCard);
    });
  });

  describe('moveCard', () => {
    it('should move a card to a different column and position', async () => {
      const cardId = 1;
      const newColumnId = 2;
      const newPosition = 1;

      const mockCard = {
        id: 1,
        title: 'Test Card',
        columnId: 1,
        position: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockNewColumn = { id: 2, title: 'New Column' };
      const movedCard = {
        ...mockCard,
        columnId: newColumnId,
        position: newPosition,
      };

      mockRepository.findOne
        .mockResolvedValueOnce(mockCard) // First call for card validation
        .mockResolvedValueOnce(movedCard); // Second call for returning moved card
      mockColumnsService.findOne.mockResolvedValue(mockNewColumn);
      mockRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.moveCard(cardId, newColumnId, newPosition);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: cardId },
        relations: ['column'],
      });
      expect(mockColumnsService.findOne).toHaveBeenCalledWith(newColumnId);
      expect(mockRepository.update).toHaveBeenCalledWith(cardId, {
        columnId: newColumnId,
        position: newPosition,
      });
      expect(result).toEqual(movedCard);
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

      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.find.mockResolvedValue(mockUpdatedCards);

      const result = await service.updatePositions(positionUpdates);

      expect(mockRepository.update).toHaveBeenCalledTimes(3);
      expect(mockRepository.update).toHaveBeenCalledWith(1, {
        position: 1,
        columnId: 1,
      });
      expect(mockRepository.update).toHaveBeenCalledWith(2, {
        position: 0,
        columnId: 1,
      });
      expect(mockRepository.update).toHaveBeenCalledWith(3, {
        position: 2,
        columnId: 2,
      });
      expect(mockRepository.find).toHaveBeenCalledWith({
        relations: ['column'],
        order: { position: 'ASC', createdAt: 'ASC' },
      });
      expect(result).toEqual(mockUpdatedCards);
    });

    it('should update positions without columnId when not provided', async () => {
      const positionUpdates = [
        { id: 1, position: 1 },
        { id: 2, position: 0 },
      ];

      const mockUpdatedCards = [
        { id: 1, title: 'Card 1', position: 1 },
        { id: 2, title: 'Card 2', position: 0 },
      ];

      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.find.mockResolvedValue(mockUpdatedCards);

      const result = await service.updatePositions(positionUpdates);

      expect(mockRepository.update).toHaveBeenCalledWith(1, { position: 1 });
      expect(mockRepository.update).toHaveBeenCalledWith(2, { position: 0 });
      expect(result).toEqual(mockUpdatedCards);
    });
  });
});
