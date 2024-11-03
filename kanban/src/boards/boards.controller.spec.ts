import { Test, TestingModule } from '@nestjs/testing';
import { BoardsController } from './boards.controller';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { Board } from './entities/board.entity';
import { UpdateResult } from 'typeorm';

describe('BoardsController', () => {
  let controller: BoardsController;
  let service: BoardsService;

  const mockBoardsService = {
    create: jest.fn(dto => {
       return {
        generatedMaps: [{ id: 1, status: 1 }],
        raw: [],
        affected: 1,
      } as UpdateResult;
    }),
    findAll: jest.fn(() => {
      return [
        { id: 1, name: 'Test Board 1', lanes: [], status: 1,userId:1 }, 
        { id: 2, name: 'Test Board 2', lanes: [], status: 1,userId:1 },
      ]as Board[];
    }),
    findOne: jest.fn(id => {
      return { id, name: `Test Board ${id}`,lanes: [], status: 1,userId:1 } as Board;
    }),
    update: jest.fn((id, dto) => {
      return {
        generatedMaps: [],
        raw: [],
        affected: 1,
      } as UpdateResult;
    }),
    remove: jest.fn(id => {
      return {
        generatedMaps: [],
        raw: [],
        affected: 1,
      } as UpdateResult;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BoardsController],
      providers: [
        {
          provide: BoardsService,
          useValue: mockBoardsService,
        },
      ],
    }).compile();

    controller = module.get<BoardsController>(BoardsController);
    service = module.get<BoardsService>(BoardsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new board', async () => {
      const createBoardDto: CreateBoardDto = { name: 'Test Board', status: 1, userId: 1 };
      const result = await controller.create(createBoardDto);

      expect(result).toEqual({
        generatedMaps: [{ id: 1, status: 1 }],
        raw: [],
        affected: 1,
      });
      expect(service.create).toHaveBeenCalledWith(createBoardDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of boards', async () => {
      const result = await controller.findAll();

      expect(result).toEqual([
        { id: 1, name: 'Test Board 1', lanes: [], status: 1,userId:1 }, 
        { id: 2, name: 'Test Board 2', lanes: [], status: 1,userId:1 },
      ] as Board[]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single board', async () => {
      const result = await controller.findOne('1');

      expect(result).toEqual({ id: 1, name: 'Test Board 1', lanes: [], status: 1,userId:1 });
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a board', async () => {
      const updateBoardDto: UpdateBoardDto = { name: 'Updated Board' };
      const result = await controller.update('1', updateBoardDto);

      expect(result).toEqual({
        generatedMaps: [],
        raw: [],
        affected: 1,
      } as UpdateResult);
      expect(service.update).toHaveBeenCalledWith(1, updateBoardDto);
    });
  });

  describe('remove', () => {
    it('should remove a board', async () => {
      const result = await controller.remove('1');

      expect(result).toEqual({
        generatedMaps: [],
        raw: [],
        affected: 1,
      } as UpdateResult);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});