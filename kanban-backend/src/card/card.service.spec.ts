import { Test, TestingModule } from '@nestjs/testing';
import { CardService } from './card.service';
import { PrismaService } from '../prisma/prisma.service';
import TestUtil from '../common/util/TestUtil';

describe('CardService', () => {
  let service: CardService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardService,
        {
          provide: PrismaService,
          useValue: {
            card: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<CardService>(CardService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prisma).toBeDefined();
  });

  describe('create', () => {
    it('should create a card successfully', async () => {
      const card = TestUtil.giveMeAvalidCard();
      prisma.card.create = jest.fn().mockResolvedValue(card);

      const createdCard = await service.createCard(card);

      expect(createdCard).toMatchObject(card);
      expect(prisma.card.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return a Card by id', async () => {
      const card = TestUtil.giveMeAvalidCard();
      prisma.card.findUnique = jest.fn().mockResolvedValue(card);

      const foundCard = await service.findCardById(card.id);

      expect(foundCard).toMatchObject(card);
      expect(prisma.card.findUnique).toHaveBeenCalledTimes(1);
    });

    it('should throw an exception if card not found', async () => {
      prisma.card.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.findCardById(999)).rejects.toThrowError(
        `Card with ID 999 not found`,
      );
      expect(prisma.card.findUnique).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('should return an array of cards', async () => {
      const card = TestUtil.giveMeAvalidCard();
      prisma.card.findMany = jest.fn().mockResolvedValue([card, card]);

      const cards = await service.findAllCard();

      expect(cards).toHaveLength(2);
      expect(prisma.card.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('should update a card successfully', async () => {
      const card = TestUtil.giveMeAvalidCard();
      const updatedCard = { ...card, name: 'Updated Name' };
      prisma.card.update = jest.fn().mockResolvedValue(updatedCard);

      const result = await service.updateCard(card.id, {
        title: 'Updated title',
      });

      expect(result).toMatchObject(updatedCard);
      expect(prisma.card.update).toHaveBeenCalledTimes(1);
    });

    it('should throw an exception if card to update not found', async () => {
      prisma.card.update = jest
        .fn()
        .mockRejectedValue(new Error('Card not found'));

      await expect(
        service.updateCard(999, { title: 'Updated title' }),
      ).rejects.toThrow(`Card with ID 999 not found`);
      expect(prisma.card.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete', () => {
    it('should delete a card successfully', async () => {
      const card = TestUtil.giveMeAvalidCard();
      prisma.card.findUnique = jest.fn().mockResolvedValue(card);
      prisma.card.delete = jest.fn().mockResolvedValue(card);

      const deletedCard = await service.deleteCard(card.id);

      expect(deletedCard).toBe(true);
      expect(prisma.card.delete).toHaveBeenCalledWith({
        where: { id: card.id },
      });
    });

    it('should throw an exception if card to delete not found', async () => {
      prisma.card.delete = jest
        .fn()
        .mockRejectedValue(new Error('Card not found'));

      await expect(service.deleteCard(999)).rejects.toThrow(
        `Card with ID 999 not found`,
      );
      expect(prisma.card.delete).toHaveBeenCalledTimes(1);
    });
  });
});
