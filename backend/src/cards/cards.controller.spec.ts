import { Test, TestingModule } from '@nestjs/testing';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { Card } from './entities/card.entity';
import { Badge } from '../badges/entities/badge.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('CardsController', () => {
  let controller: CardsController;
  let service: CardsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CardsController],
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

    controller = module.get<CardsController>(CardsController);
    service = module.get<CardsService>(CardsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new card', async () => {
      const createCardDto: CreateCardDto = {
        title: 'Test Card',
        description: 'Test Description',
        kanban_id: '1',
        date_end: new Date(),
        order: 0,
        badges: []
      };

      const createdCard: Card = {
        id: expect.any(String),
        title: 'Test Card',
        description: 'Test Description',
        kanban_id: '1',
        date_end: new Date(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        order: 0,
        badges: []
      };

      jest.spyOn(service, 'create').mockResolvedValueOnce(createdCard);

      const result = await controller.create(createCardDto);

      expect(result.card.id).toHaveLength(36);
      expect(result.card.title).toEqual('Test Card');
      expect(result.message).toEqual('Cartão criado com sucesso !');
    });
  });

  describe('find', () => {
    it('should return all cards for a given kanban_id', async () => {
      const kanbanId = '1';
      const cards: Card[] = [
        {
          id: '1', title: 'Card 1', description: 'Description 1', kanban_id: kanbanId, date_end: new Date(),createdAt: new Date().toISOString(),updatedAt: new Date().toISOString(),deletedAt: null,order: 0,badges: [] },
        { id: '2', title: 'Card 2', description: 'Description 2', kanban_id: kanbanId, date_end: new Date(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), deletedAt: null, order: 0, badges: [] },
      ];

      jest.spyOn(service, 'findAll').mockResolvedValueOnce(cards);

      const result = await controller.findAll(kanbanId);

      expect(result).toEqual(cards);
    });
    it('should return a card by id', async () => {
      const cardId = '1';
      const card: Card = {
        id: '1', title: 'Test Card', description: 'Test Description', kanban_id: '1', date_end: new Date(),
        order: 0,
        createdAt: '',
        updatedAt: '',
        deletedAt: '',
        badges: []
      };
  
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(card);
  
      const result = await controller.findOne(cardId);
  
      expect(result).toEqual(card);
    });
  });

  describe('update', () => {
    it('should update a card', async () => {
      const cardId = '1';
      const updateCardDto: UpdateCardDto = { title: 'Updated Card', description: 'Updated Description', date_end: new Date() };
      const updatedCard: Card = {
        id: cardId, title: 'Updated Card', description: 'Updated Description', kanban_id: '1', date_end: new Date(),
        order: 0,
        createdAt: '',
        updatedAt: '',
        deletedAt: '',
        badges: []
      };

      jest.spyOn(service, 'update').mockResolvedValueOnce(updatedCard as any);

      const result = await controller.update(cardId, updateCardDto);

      expect(result).toEqual({
        card: updatedCard,
        message: 'Cartão alterado com sucesso',
      });
    });
  });

  describe('linkBadgeToCard', () => {
    it('should link a badge to a card', async () => {
      const cardId = '1';
      const badgeId = '1';
      const card: Card = {
        id: cardId, title: 'Updated Card', description: 'Updated Description', kanban_id: '1', date_end: new Date(),order: 0,createdAt: '',updatedAt: '',deletedAt: '',badges: []
      };

      jest.spyOn(service, 'linkBadgeToCard').mockResolvedValueOnce(card);
      const result = await controller.linkBadgeToCard(cardId, badgeId);

      expect(result).toEqual({
        link: card,
        message: 'Badge colocado no cartão com sucesso',
      });
    });
  });

  describe('remove', () => {
    it('should remove a card', async () => {
      const cardId = '1';
      const removedCard: Card = {
        id: '1', title: 'Test Card', description: 'Test Description', kanban_id: '1', date_end: new Date(),
        order: 0,
        createdAt: '',
        updatedAt: '',
        deletedAt: '',
        badges: []
      };

      jest.spyOn(service, 'remove').mockResolvedValueOnce(removedCard as any);

      const result = await controller.remove(cardId);

      expect(result).toEqual({
        card: removedCard,
        message: 'Cartão deletado com sucesso',
      });
    });
  });

  describe('unlinkBadgeToCard', () => {
    it('should unlink a badge from a card', async () => {
      const cardId = '1';
      const badgeId = '1';
      const card: Card = {
        id: cardId, title: 'Updated Card', description: 'Updated Description', kanban_id: '1', date_end: new Date(), order: 0, createdAt: '', updatedAt: '', deletedAt: '', badges: []
      };

      jest.spyOn(service, 'unlinkBadgeToCard').mockResolvedValueOnce(card);
      const result = await controller.unlinkBadgeToCard(cardId, badgeId);

      expect(result).toEqual({
        unlink: card,
        message: 'Badge retirado do cartão com sucesso',
      });
    });
  });
});

