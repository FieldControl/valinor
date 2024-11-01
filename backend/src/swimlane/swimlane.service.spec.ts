import { Test, TestingModule } from '@nestjs/testing';
import { SwimlaneService } from './swimlane.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Swimlane } from './entities/swimlane.entity';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CreateSwimlaneDto } from './dto/create-swimlane.dto';
import { UpdateSwimlaneDto } from './dto/update-swimlane.dto';
import { ReordereSwimlaneDto } from './dto/reorder-swimlane.dto';

describe('SwimlaneService', () => {
  let service: SwimlaneService;
  let repository: Repository<Swimlane>;
  let userService: UserService;

  const mockSwimlaneRepository = {
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
    findOne: jest.fn(),
  };

  const mockUserService = {
    isConnectedToBoard: jest.fn(),
    isConnectedToSwimlane: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SwimlaneService,
        {
          provide: getRepositoryToken(Swimlane),
          useValue: mockSwimlaneRepository,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    service = module.get<SwimlaneService>(SwimlaneService);
    repository = module.get<Repository<Swimlane>>(getRepositoryToken(Swimlane));
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a swimlane', async () => {
      const createSwimlaneDto: CreateSwimlaneDto = {
        name: 'New Swimlane',
        order: 1,
        boardId: 1,
      };
      const userId = 1;

      mockUserService.isConnectedToBoard.mockResolvedValue(undefined);
      mockSwimlaneRepository.save.mockResolvedValue(createSwimlaneDto);

      const result = await service.create(createSwimlaneDto, userId);
      expect(result).toEqual(createSwimlaneDto);
      expect(mockUserService.isConnectedToBoard).toHaveBeenCalledWith(userId, createSwimlaneDto.boardId);
      expect(mockSwimlaneRepository.save).toHaveBeenCalledWith(expect.objectContaining(createSwimlaneDto));
    });
  });

  describe('updateSwimlaneOrders', () => {
    it('should update swimlane orders', async () => {
      const reorderDto: ReordereSwimlaneDto = {
        boardId: 1,
        items: [
          { id: 1, order: 1 },
          { id: 2, order: 2 },
        ],
      };
      const userId = 1;

      mockUserService.isConnectedToBoard.mockResolvedValue(undefined);

      await service.updateSwimlaneOrders(reorderDto, userId);

      expect(mockUserService.isConnectedToBoard).toHaveBeenCalledWith(userId, reorderDto.boardId);
      expect(mockSwimlaneRepository.update).toHaveBeenCalledWith(reorderDto.items[0].id, { order: 1 });
      expect(mockSwimlaneRepository.update).toHaveBeenCalledWith(reorderDto.items[1].id, { order: 2 });
    });
  });

  describe('hasAccessToSwimlane', () => {
    it('should return true if user has access to the swimlane', async () => {
      const swimlaneId = 1;
      const userId = 1;

      mockSwimlaneRepository.count.mockResolvedValue(1);
      const result = await service.hasAccessToSwimlane(swimlaneId, userId);
      expect(result).toBe(true);
    });

    it('should return false if user does not have access to the swimlane', async () => {
      const swimlaneId = 1;
      const userId = 1;

      mockSwimlaneRepository.count.mockResolvedValue(0);
      const result = await service.hasAccessToSwimlane(swimlaneId, userId);
      expect(result).toBe(false);
    });
  });

  describe('findAllByBoardId', () => {
    it('should return all swimlanes for a board', async () => {
      const boardId = 1;
      const userId = 1;

      const swimlanes = [{ id: 1, name: 'Swimlane 1', boardId }];
      mockSwimlaneRepository.find.mockResolvedValue(swimlanes);

      const result = await service.findAllByBoardId(boardId, userId);
      expect(result).toEqual(swimlanes);
      expect(mockSwimlaneRepository.find).toHaveBeenCalledWith({
        where: {
          boardId,
          board: { users: { id: userId } },
        },
      });
    });
  });

  describe('update', () => {
    it('should update a swimlane', async () => {
      const id = 1;
      const userId = 1;
      const updateSwimlaneDto: UpdateSwimlaneDto = { name: 'Updated Swimlane', boardId: 1 };

      mockUserService.isConnectedToBoard.mockResolvedValue(undefined);
      mockSwimlaneRepository.update.mockResolvedValue(undefined);

      await service.update(id, userId, updateSwimlaneDto);
      expect(mockUserService.isConnectedToBoard).toHaveBeenCalledWith(userId, updateSwimlaneDto.boardId);
      expect(mockSwimlaneRepository.update).toHaveBeenCalledWith(id, { name: updateSwimlaneDto.name });
    });
  });

  describe('remove', () => {
    it('should remove a swimlane', async () => {
      const id = 1;
      const userId = 1;

      mockUserService.isConnectedToSwimlane.mockResolvedValue(undefined);
      mockSwimlaneRepository.delete.mockResolvedValue(undefined);

      await service.remove(id, userId);
      expect(mockUserService.isConnectedToSwimlane).toHaveBeenCalledWith(userId, id);
      expect(mockSwimlaneRepository.delete).toHaveBeenCalledWith(id);
    });
  });
});
