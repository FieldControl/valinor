import { Test, TestingModule } from '@nestjs/testing';
import { KanbansController } from './kanbans.controller';
import { KanbansService } from './kanbans.service';
import { CreateKanbanDto } from './dto/create-kanban.dto';
import { UpdateKanbanDto } from './dto/update-kanban.dto';
import { Kanban } from './entities/kanban.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from '../cards/entities/card.entity';

describe('KanbansController', () => {
  let controller: KanbansController;
  let service: KanbansService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KanbansController],
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

    controller = module.get<KanbansController>(KanbansController);
    service = module.get<KanbansService>(KanbansService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new kanban', async () => {
      const createKanbanDto: CreateKanbanDto = { name: 'Test Kanban' };
      const createdKanban: Kanban = {
        id: expect.any(String),
        name: 'Test Kanban',
        createdAt: new Date().toDateString(),
        updatedAt: new Date().toDateString(),
        deletedAt: null,
        cards: [],
      };
      jest.spyOn(service, 'create').mockResolvedValueOnce(createdKanban);
      const result = await controller.create(createKanbanDto);
      expect(result.kanban.id).toHaveLength(36);
      expect(result.kanban.name).toEqual(createdKanban.name);
      expect(result.message).toEqual('Lista Criada com sucesso !');
    });
  });

  describe('findAll', () => {
    it('should return an array of kanbans', async () => {
      const result: Kanban[] = [{
        id: '1',
        name: 'Test Kanban',
        createdAt: new Date().toDateString(),
        updatedAt: new Date().toDateString(),
        deletedAt: null,
        cards: [],
      }];
      jest.spyOn(service, 'findAll').mockResolvedValueOnce(result);
      expect(await controller.findAll()).toEqual(result);
    });
  });

  describe('findOne', () => {
    it('should return a kanban by id', async () => {
      const id = '1';
      const result: Kanban = {
        id: '1',
        name: 'Test Kanban',
        createdAt: new Date().toDateString(),
        updatedAt: new Date().toDateString(),
        deletedAt: null,
        cards: [],
      };
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(result);
      expect(await controller.findOne(id)).toEqual(result);
    });
  });

  describe('update', () => {
    it('should update a kanban', async () => {
      const id = '1';
      const updateKanbanDto: UpdateKanbanDto = { name: 'Updated Kanban' };
      const updatedKanban: Kanban = {
        id: '1',
        name: 'Updated Kanban',
        createdAt: new Date().toDateString(),
        updatedAt: new Date().toDateString(),
        deletedAt: null,
        cards: [],
      };
      jest.spyOn(service, 'update').mockResolvedValueOnce(updatedKanban as any);
      const result = await controller.update(id, updateKanbanDto);
      expect(result.kanban).toEqual(updatedKanban);
      expect(result.message).toEqual('Lista atualizada com sucesso !');
    });
  });

  describe('remove', () => {
    it('should delete a kanban', async () => {
      const id = '1';
      const deletedKanban: Kanban = {
        id: '1',
        name: 'Test Kanban',
        createdAt: new Date().toDateString(),
        updatedAt: new Date().toDateString(),
        deletedAt: null,
        cards: [],
      };
      jest.spyOn(service, 'remove').mockResolvedValueOnce(deletedKanban);
      const result = await controller.remove(id);
      expect(result.kanban).toEqual(deletedKanban);
      expect(result.message).toEqual('Lista deletada com sucesso !');
    });
  });
});
