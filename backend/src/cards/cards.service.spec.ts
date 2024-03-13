import { Test, TestingModule } from '@nestjs/testing';
import { CardsService } from './cards.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Card } from './entities/card.entity';
import { Badge } from '../badges/entities/badge.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';

describe('CardsService', () => {
  let service: CardsService;
  let cardRepository: Repository<Card>;
  let badgeRepository: Repository<Badge>;
  const mockCard = {
    id: '1',
    kanban_id: '1',
    title: 'Test Card',
    order: 1,
    description: 'Test Description',
    date_end: new Date('2024-03-13'),
    badges: [
      {
        id: '1',
        name: 'Test Badge',
        color: 'blue',
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  };
  const mockCards = [{
    id: '1',
    kanban_id: '1',
    title: 'Test Card',
    order: 1,
    description: 'Test Description',
    date_end: new Date('2024-03-13'),
    badges: [
      {
        id: '1',
        name: 'Test Badge',
        color: 'blue',
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  }, {
    id: '2',
    kanban_id: '1',
    title: 'Test Card 2',
    order: 1,
    description: 'Test Description2',
    date_end: new Date('2024-03-13'),
    badges: [
      {
        id: '2',
        name: 'Test Badge 2',
        color: 'orange',
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  }];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardsService,
        {
          provide: getRepositoryToken(Card),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Badge),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<CardsService>(CardsService);
    cardRepository = module.get<Repository<Card>>(getRepositoryToken(Card));
    badgeRepository = module.get<Repository<Badge>>(getRepositoryToken(Badge));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new card', async () => {
      const createCardDto: CreateCardDto = {
        kanban_id: '1',
        title: 'Test Card',
        order: 1,
        description: 'Test Description',
        date_end: new Date('2024-03-13'),
        badges: [
          {
            id: '1',
            name: 'Test Badge',
            color: 'blue',
          },
        ],
      };

      jest.spyOn(service, 'create').mockResolvedValueOnce(mockCard as any);

      const result = await service.create(createCardDto);

      expect(result).toEqual(mockCard);
    });
  });

  describe('findAll', () => {
    it('should find all cards for a given kanban', async () => {
      const kanbanId = '1';

      jest.spyOn(cardRepository, 'createQueryBuilder').mockReturnValueOnce({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValueOnce(mockCards),
      } as any);

      const result = await service.findAll(kanbanId);

      expect(result).toEqual(mockCards);
    });
  });

  describe('findOne', () => {
    it('should find a card by id', async () => {
      const id = '1';

      jest.spyOn(cardRepository, 'findOne').mockResolvedValueOnce(mockCard as any);

      const result = await service.findOne(id);

      expect(result).toEqual(mockCard);
    });

    it('should throw NotFoundException if card is not found', async () => {
      const id = '999';

      jest.spyOn(cardRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a card', async () => {
      const id = '1';
      const updateData: Partial<Card> = { title: "Updated card" };

      jest.spyOn(cardRepository, 'update').mockResolvedValueOnce(updateData as any);
      jest.spyOn(cardRepository, 'findOne').mockResolvedValueOnce(mockCard as any);

      const result = await service.update(id, updateData);

      expect(result).toEqual(mockCard);
    });
  });

  describe('remove', () => {
    it('should remove a card', async () => {
      const id = '1';

      jest.spyOn(cardRepository, 'findOne').mockResolvedValueOnce(mockCard as any);
      jest.spyOn(cardRepository, 'delete').mockResolvedValueOnce(undefined);

      const result = await service.remove(id);

      expect(result).toEqual(mockCard);
    });
  });

  describe('linkBadgeToCard', () => {
    it('should link a badge to a card', async () => {
      const cardId = '1';
      const badgeId = '1';

      const mockBadge: Badge = {
        id: '1',
        name: 'Test Badge',
        color: 'blue',
        createdAt: '',
        updatedAt: '',
        deletedAt: ''
      };

      jest.spyOn(cardRepository, 'findOne').mockResolvedValueOnce(mockCard as any);
      jest.spyOn(badgeRepository, 'findOne').mockResolvedValueOnce(mockBadge as any);
      jest.spyOn(cardRepository, 'save').mockResolvedValueOnce(mockCard as any);

      const result = await service.linkBadgeToCard(cardId, badgeId);

      expect(result).toEqual(mockCard);
    });

    it('should throw NotFoundException if badge is not found', async () => {
      const cardId = '1';
      const badgeId = '999';

      jest.spyOn(cardRepository, 'findOne').mockResolvedValueOnce(mockCard as any);
      jest.spyOn(badgeRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(service.linkBadgeToCard(cardId, badgeId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('unlinkBadgeToCard', () => {
    it('should unlink a badge from a card', async () => {
      const cardId = '1';
      const badgeId = '1';

      jest.spyOn(cardRepository, 'findOne').mockResolvedValueOnce(mockCard as any);
      jest.spyOn(cardRepository, 'save').mockResolvedValueOnce(mockCard as any);

      const result = await service.unlinkBadgeToCard(cardId, badgeId);

      expect(result).toEqual(mockCard);
    });
  });
});
