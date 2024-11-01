import { Test, TestingModule } from '@nestjs/testing';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { AuthGuard } from 'src/auth/auth/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { PayloadRequest } from 'src/auth/auth/auth.guard';

// Mock do BoardService
const mockBoardService = {
  create: jest.fn(),
  findAllByUserId: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

// Interface CustomHeaders para incluir Authorization
interface CustomHeaders extends Record<string, string | undefined> {
  Authorization?: string;
}

// Mock para PayloadRequest
// Mock para PayloadRequest
const headers = new Headers();
headers.set('Authorization', 'Bearer token');

const mockRequest: Partial<PayloadRequest> = {
  user: {
    id: 1,
    email: 'test@example.com',
  },
  headers,
};

// Mock do AuthGuard
const mockAuthGuard = {
  canActivate: jest.fn(() => true), // permite que todos os testes passem
};

// Mock do JwtService
const mockJwtService = {
  sign: jest.fn(() => 'mockToken'),
  verify: jest.fn(() => ({ id: 1, email: 'test@example.com' })),
};

describe('BoardController', () => {
  let controller: BoardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BoardController],
      providers: [
        {
          provide: BoardService,
          useValue: mockBoardService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<BoardController>(BoardController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a board', async () => {
      const createBoardDto: CreateBoardDto = { name: 'My New Board' };
      mockBoardService.create.mockResolvedValue({ id: 1, ...createBoardDto });

      const result = await controller.create(createBoardDto, mockRequest as PayloadRequest);
      expect(result).toEqual({ id: 1, ...createBoardDto });
      expect(mockBoardService.create).toHaveBeenCalledWith(createBoardDto, mockRequest.user.id);
    });

    it('should handle errors when creating a board', async () => {
      const createBoardDto: CreateBoardDto = { name: 'My New Board' };
      mockBoardService.create.mockRejectedValue(new Error('Failed to create board'));

      await expect(controller.create(createBoardDto, mockRequest as PayloadRequest)).rejects.toThrow('Failed to create board');
      expect(mockBoardService.create).toHaveBeenCalledWith(createBoardDto, mockRequest.user.id);
    });
  });

  describe('findAll', () => {
    it('should return all boards for the user', async () => {
      const boards = [{ id: 1, name: 'Board 1' }, { id: 2, name: 'Board 2' }];
      mockBoardService.findAllByUserId.mockResolvedValue(boards);

      const result = await controller.findAll(mockRequest as PayloadRequest);
      expect(result).toEqual(boards);
      expect(mockBoardService.findAllByUserId).toHaveBeenCalledWith(mockRequest.user.id);
    });
  });

  describe('findOne', () => {
    it('should return a board by ID', async () => {
      const board = { id: 1, name: 'Board 1', swimlanes: [] };
      mockBoardService.findOne.mockResolvedValue(board);

      const result = await controller.findOne('1', mockRequest as PayloadRequest);
      expect(mockBoardService.findOne).toHaveBeenCalledWith(1, mockRequest.user.id);
      expect(result).toEqual(board);
    });

    it('should handle errors when finding a board by ID', async () => {
      mockBoardService.findOne.mockRejectedValue(new Error('Board not found'));

      await expect(controller.findOne('1', mockRequest as PayloadRequest)).rejects.toThrow('Board not found');
      expect(mockBoardService.findOne).toHaveBeenCalledWith(1, mockRequest.user.id);
    });
  });

  describe('update', () => {
    it('should update a board', async () => {
      const updateBoardDto: UpdateBoardDto = { name: 'Updated Board Name' };
      mockBoardService.update.mockResolvedValue({ id: 1, ...updateBoardDto });

      const result = await controller.update('1', mockRequest as PayloadRequest, updateBoardDto);
      expect(mockBoardService.update).toHaveBeenCalledWith(1, mockRequest.user.id, updateBoardDto);
      expect(result).toEqual({ id: 1, ...updateBoardDto });
    });

    it('should handle errors when updating a board', async () => {
      const updateBoardDto: UpdateBoardDto = { name: 'Updated Board Name' };
      mockBoardService.update.mockRejectedValue(new Error('Failed to update board'));

      await expect(controller.update('1', mockRequest as PayloadRequest, updateBoardDto)).rejects.toThrow('Failed to update board');
      expect(mockBoardService.update).toHaveBeenCalledWith(1, mockRequest.user.id, updateBoardDto);
    });
  });

  describe('remove', () => {
    it('should remove a board', async () => {
      mockBoardService.remove.mockResolvedValue(undefined);

      await controller.remove('1', mockRequest as PayloadRequest);
      expect(mockBoardService.remove).toHaveBeenCalledWith(1, mockRequest.user.id);
    });

    it('should handle errors when removing a board', async () => {
      mockBoardService.remove.mockRejectedValue(new Error('Failed to remove board'));

      await expect(controller.remove('1', mockRequest as PayloadRequest)).rejects.toThrow('Failed to remove board');
      expect(mockBoardService.remove).toHaveBeenCalledWith(1, mockRequest.user.id);
    });
  });
});
