import { Test, TestingModule } from '@nestjs/testing';
import { SwimlaneController } from './swimlane.controller';
import { SwimlaneService } from './swimlane.service';
import { CreateSwimlaneDto } from './dto/create-swimlane.dto';
import { UpdateSwimlaneDto } from './dto/update-swimlane.dto';
import { ReordereSwimlaneDto } from './dto/reorder-swimlane.dto';
import { PayloadRequest } from 'src/auth/auth/auth.guard';
import { JwtService } from '@nestjs/jwt';

describe('SwimlaneController', () => {
  let controller: SwimlaneController;
  let service: SwimlaneService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SwimlaneController],
      providers: [
        {
          provide: SwimlaneService,
          useValue: {
            create: jest.fn().mockResolvedValue({ id: 1, name: 'New Swimlane' }),
            updateSwimlaneOrders: jest.fn().mockResolvedValue(true),
            findAllByBoardId: jest.fn().mockResolvedValue([{ id: 1, name: 'Swimlane 1' }]),
            update: jest.fn().mockResolvedValue({ id: 1, name: 'Updated Swimlane' }),
            remove: jest.fn().mockResolvedValue({ deleted: true }),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mockJwtToken'),
            verify: jest.fn().mockReturnValue({ id: 1 }),
          },
        },
      ],
    }).compile();

    controller = module.get<SwimlaneController>(SwimlaneController);
    service = module.get<SwimlaneService>(SwimlaneService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create with the correct parameters', async () => {
      const createSwimlaneDto: CreateSwimlaneDto = {
        name: 'New Swimlane',
        order: 1,
        boardId: 123,
      };
      const userId = 1;
      const req = { user: { id: userId } } as PayloadRequest;

      await controller.create(req, createSwimlaneDto);

      expect(service.create).toHaveBeenCalledWith(createSwimlaneDto, userId);
    });
  });

  describe('updateOrder', () => {
    it('should call service.updateSwimlaneOrders with the correct parameters', async () => {
      const reorderedSwimlanes: ReordereSwimlaneDto = {
        boardId: 0,
        items: []
      };
      const userId = 1;
      const req = { user: { id: userId } } as PayloadRequest;

      await controller.updateOrder(req, reorderedSwimlanes);

      expect(service.updateSwimlaneOrders).toHaveBeenCalledWith(reorderedSwimlanes, userId);
    });
  });

  describe('findAll', () => {
    it('should call service.findAllByBoardId with the correct parameters', async () => {
      const boardId = '123';
      const userId = 1;
      const req = { user: { id: userId } } as PayloadRequest;

      await controller.findAll(boardId, req);

      expect(service.findAllByBoardId).toHaveBeenCalledWith(Number(boardId), userId);
    });
  });

  describe('update', () => {
    it('should call service.update with the correct parameters', async () => {
      const updateSwimlaneDto: UpdateSwimlaneDto = {
        name: 'Updated Swimlane',
        order: 2,
      };
      const swimlaneId = '1';
      const userId = 1;
      const req = { user: { id: userId } } as PayloadRequest;

      await controller.update(swimlaneId, updateSwimlaneDto, req);

      expect(service.update).toHaveBeenCalledWith(+swimlaneId, userId, updateSwimlaneDto);
    });
  });

  describe('remove', () => {
    it('should call service.remove with the correct parameters', async () => {
      const swimlaneId = '1';
      const userId = 1;
      const req = { user: { id: userId } } as PayloadRequest;

      await controller.remove(swimlaneId, req);

      expect(service.remove).toHaveBeenCalledWith(+swimlaneId, userId);
    });
  });
});
