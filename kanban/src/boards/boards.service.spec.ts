import { Test, TestingModule } from '@nestjs/testing';
import { BoardsService } from './boards.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Board } from './entities/board.entity';
import { InsertResult, Repository, UpdateResult } from 'typeorm';
import { User } from '../users/entities/user.entity';

const mockBoardsRepository = () => ({
  insert: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
});

describe('BoardsService', () => {
  let service: BoardsService;
  let repository: Repository<Board>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardsService,
        {
          provide: getRepositoryToken(Board),
          useFactory: mockBoardsRepository,
        },
      ],
    }).compile();

    service = module.get<BoardsService>(BoardsService);
    repository = module.get<Repository<Board>>(getRepositoryToken(Board));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should insert a new board', async () => {
      const createBoardDto = { name: 'Test Board', status: 1, userId: 1 };
      jest.spyOn(repository, 'insert').mockResolvedValue({
        generatedMaps: [{ id: 1, status: 1 }],
        identifiers: [{ id: 1 }],
        raw: [{ id: 1 }],
      } as InsertResult);


      const result = await service.create(createBoardDto);
      expect(result.generatedMaps).toHaveLength(1);
      expect(result.generatedMaps[0].id).toBe(1);
      expect(repository.insert).toHaveBeenCalledWith(createBoardDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of boards', async () => {
      const boards = [{id:1, name: 'Test Board', status: 1, user:new User(),userId: 1, lanes:[] }];
      jest.spyOn(repository, 'find').mockResolvedValue(boards);

      const result = await service.findAll();

      expect(result).toEqual(boards);
      expect(repository.find).toHaveBeenCalledWith({ where: { status: 1 } });
    });
  });

  describe('findOne', () => {
    it('should return a single board', async () => {
      const board = {id:1, name: 'Test Board', status: 1, user:new User(),userId: 1, lanes:[] };
      jest.spyOn(repository, 'findOne').mockResolvedValue(board);

      const result = await service.findOne(1);

      expect(result).toEqual(board);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1, status: 1 } });
    });
  });

  describe('update', () => {
    it('should update a board', async () => {
      const updateBoardDto = { name: 'Updated Board' };
      jest.spyOn(repository, 'update').mockResolvedValue({
        generatedMaps: [{ id: 1, status: 1 }],
        raw: [{ id: 1 }],
        affected:1
      } as UpdateResult);

      const result = await service.update(1, updateBoardDto);
      expect(result.affected).toBe(1);  
      expect(repository.update).toHaveBeenCalledWith(1, updateBoardDto);
    });
  });

  describe('remove', () => {
    it('should update the status of a board to 0', async () => {
      jest.spyOn(repository, 'update').mockResolvedValue(
        {
          generatedMaps: [{ id: 1, status: 0 }],
          raw: [{ id: 1 }],
          affected:1
        } as UpdateResult
      );

      const result = await service.remove(1);
      expect(result.affected).toBe(1);
      expect(repository.update).toHaveBeenCalledWith(1, { status: 0 });
    });
  });
});