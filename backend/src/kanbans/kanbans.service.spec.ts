import { Test, TestingModule } from '@nestjs/testing';
import { KanbansService } from './kanbans.service';
import { Kanban } from './entities/kanban.entity';
import { Card } from '../cards/entities/card.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ListKanbanDto } from './dto/list-kanban.dto';

describe('KanbansService', () => {
  let service: KanbansService;
  let kanbanRepository: Repository<Kanban>;
  let cardRepository: Repository<Card>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KanbansService,
        {
          provide: getRepositoryToken(Kanban),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Card),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<KanbansService>(KanbansService);
    kanbanRepository = module.get<Repository<Kanban>>(getRepositoryToken(Kanban));
    cardRepository = module.get<Repository<Card>>(getRepositoryToken(Card));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new kanban', async () => {
      const createKanbanDto: Kanban = {
        id: '1',
        name: 'Test Kanban',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        cards: [],
      };
      const savedKanban: Kanban = { ...createKanbanDto };
      jest.spyOn(kanbanRepository, 'save').mockResolvedValueOnce(savedKanban);

      const result = await service.create(createKanbanDto);

      expect(result).toEqual(savedKanban);
    });
  });

  describe('find', () => {
    it('should return an array of kanbans', async () => {
      const kanbans: Kanban[] = [
        { id: '1', name: 'Kanban 1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), deletedAt: null, cards: [] },
        { id: '2', name: 'Kanban 2', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), deletedAt: null, cards: [] }
      ];
      const expected = kanbans.map(kanban => new ListKanbanDto(kanban.id, kanban.name));
      jest.spyOn(kanbanRepository, 'find').mockResolvedValueOnce(kanbans);
      const result = await service.findAll();
      expect(result).toEqual(expected);
    });

    it('should return a kanban by id', async () => {
      const id = '1';
      const kanban: Kanban = { id: '1', name: 'Test Kanban', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), deletedAt: null, cards: [] };
      jest.spyOn(kanbanRepository, 'findOne').mockResolvedValueOnce(kanban);
  
      const result = await service.findOne(id);
  
      expect(result).toEqual(kanban);
    });
  });

  describe('update', () => {
    it('should update a kanban', async () => {
      const id = '1';
      const updateData: Partial<Kanban> = { name: 'Updated Kanban' };
      const updatedKanban: Kanban = { id: '1', name: 'Updated Kanban', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), deletedAt: null, cards: [] };
      jest.spyOn(kanbanRepository, 'update').mockResolvedValueOnce(updatedKanban as any);
      jest.spyOn(kanbanRepository, 'findOne').mockResolvedValueOnce(updatedKanban);

      const result = await service.update(id, updateData);

      expect(result).toEqual(updatedKanban);
    });
  });

  describe('remove', () => {
    it('should delete a kanban', async () => {
      const id = '1';
      const kanbanToRemove: Kanban = { id: '1', name: 'Test Kanban', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), deletedAt: null, cards: [] };
      jest.spyOn(kanbanRepository, 'findOne').mockResolvedValueOnce(kanbanToRemove);
      jest.spyOn(cardRepository, 'delete').mockResolvedValueOnce(undefined);
      jest.spyOn(kanbanRepository, 'delete').mockResolvedValueOnce(kanbanToRemove as any);

      const result = await service.remove(id);

      expect(result).toEqual(kanbanToRemove);
    });
  });

});

