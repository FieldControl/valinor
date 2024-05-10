/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { KanbanService } from './kanban.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Column, ColumnDocument } from './models/column.model';
import { Card, CardDocument } from './models/card.model';
import { NotFoundException } from '@nestjs/common';

describe('KanbanService', () => {
  let service: KanbanService
  let columnModel: Model<ColumnDocument>;
  let cardModel: Model<CardDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KanbanService,
        {
          provide: getModelToken(Column.name),
          useValue: {
            find: jest.fn().mockResolvedValue([]),
            findOne: jest.fn().mockResolvedValue(null),
            findById: jest.fn().mockResolvedValue(null),
            findOneAndUpdate: jest.fn().mockResolvedValue(null), // Adicione essa linha
            findByIdAndUpdate: jest.fn().mockResolvedValue(null), // Adicione essa linha
            create: jest.fn().mockResolvedValue({ _id: '123', name: 'Test Column' }),
            deleteOne: jest.fn().mockResolvedValue({ acknowledged: false, deletedCount: 1 }),
          },
        },
        {
          provide: getModelToken(Card.name),
          useValue: {
            find: jest.fn().mockResolvedValue([]),
            findOne: jest.fn().mockResolvedValue(null),
            findById: jest.fn().mockResolvedValue(null),
            findOneAndUpdate: jest.fn().mockResolvedValue(null), // Adicione essa linha
            findByIdAndUpdate: jest.fn().mockResolvedValue(null), // Adicione essa linha
            create: jest.fn().mockResolvedValue({ _id: '456', title: 'Test Card', description: 'Test Description' }),
            findByIdAndDelete: jest.fn().mockResolvedValue(null), // Adicione essa linha
          },
        },
      ],
    }).compile();

    service = module.get<KanbanService>(KanbanService);
    columnModel = module.get<Model<ColumnDocument>>(getModelToken(Column.name));
    cardModel = module.get<Model<CardDocument>>(getModelToken(Card.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createColumn', () => {
    it('should create a new column', async () => {
      const columnName = 'Test Column';
      const createdColumn = await service.createColumn(columnName);
      expect(createdColumn).toBeDefined();
      expect(createdColumn.name).toEqual(columnName);
    });
  });

  describe('getAllColumns', () => {
    it('should return an array of columns', async () => {
      const columns = await service.getAllColumns();
      expect(columns).toEqual([]);
    });
  });

  describe('getColumnById', () => {
    it('should return a column by ID', async () => {
      const columnId = '123';
      const column = await service.getColumnById(columnId);
      expect(column).toBeDefined();
      expect(columnId).toEqual(columnId);
    });

    it('should throw NotFoundException if column not found', async () => {
      const columnId = '999';
      jest.spyOn(columnModel, 'findById').mockResolvedValueOnce(null);
      await expect(service.getColumnById(columnId)).rejects.toThrowError(NotFoundException);
    });
  });

  describe('updateColumn', () => {
    it('should update an existing column', async () => {
      const columnId = '123';
      const newName = 'Updated Test Column';
      const updatedColumn = await service.updateColumn(columnId, newName);
      expect(updatedColumn).toBeDefined();
      expect(updatedColumn.name).toEqual(newName);
    });

    it('should throw NotFoundException if column not found', async () => {
      const columnId = '999';
      jest.spyOn(columnModel, 'findByIdAndUpdate').mockResolvedValueOnce(null);
      await expect(service.updateColumn(columnId, 'Updated Test Column')).rejects.toThrowError(NotFoundException);
    });
  });

  describe('deleteColumn', () => {
    it('should delete an existing column', async () => {
      const columnId = '123';
      await service.deleteColumn(columnId);
      expect(columnModel.deleteOne).toHaveBeenCalledWith({ _id: columnId });
    });

    it('should throw NotFoundException if column not found', async () => {
      const columnId = '999';
      jest.spyOn(columnModel, 'deleteOne').mockResolvedValueOnce({ acknowledged: false, deletedCount: 0 });
      await expect(service.deleteColumn(columnId)).rejects.toThrowError(NotFoundException);
    });
  });

  describe('createCard', () => {
    it('should create a new card', async () => {
      const columnId = '123';
      const title = 'Test Card';
      const description = 'Test Description';
      const createdCard = await service.createCard(columnId, title, description);
      expect(createdCard).toBeDefined();
      expect(createdCard.title).toEqual(title);
      expect(createdCard.description).toEqual(description);
    });
  });

  describe('getCardsInColumn', () => {
    it('should return an array of cards in a column', async () => {
      const columnId = '123';
      const cards = await service.getCardsInColumn(columnId);
      expect(cards).toEqual([]);
    });
  });

  describe('updateCard', () => {
    it('should update an existing card', async () => {
      const cardId = '456';
      const title = 'Updated Test Card';
      const description = 'Updated Test Description';
      const updatedCard = await service.updateCard(cardId, title, description);
      expect(updatedCard).toBeDefined();
      expect(updatedCard.title).toEqual(title);
      expect(updatedCard.description).toEqual(description);
    });
  });

  describe('deleteCard', () => {
    it('should delete an existing card', async () => {
      const cardId = '456';
      await service.deleteCard(cardId);
      expect(cardModel.findByIdAndDelete).toHaveBeenCalledWith(cardId);
    });
  });
});
