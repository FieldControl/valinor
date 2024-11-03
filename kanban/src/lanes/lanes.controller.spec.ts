import { Test, TestingModule } from '@nestjs/testing';
import { LanesController } from './lanes.controller';
import { LanesService } from './lanes.service';
import { CreateLaneDto } from './dto/create-lane.dto';
import { UpdateLaneDto } from './dto/update-lane.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { UpdateResult } from 'typeorm';
import { Lane } from './entities/lane.entity';

describe('LanesController', () => {
  let controller: LanesController;
  let service: LanesService;

  const mockLanesService = {
    create: jest.fn(dto => {
      return {
        id: 1,
        ...dto,
      };
    }),
    findAll: jest.fn(() => {
      return [
        { id:1, name: 'Test Lane', boardId: 1, order: 1, status: 1 } as Lane,
        {id:1, name: 'Test Lane', boardId: 1, order: 1, status: 1 } as Lane,
      ];
    }),
    findOne: jest.fn(id => {
      return { id:1, name: 'Test Lane', boardId: 1, order: 1, status: 1 } as Lane;
    }),
    update: jest.fn((id, dto) => {
      return { affected:1, generatedMaps:[], raw:[] } as UpdateResult
    }),
    remove: jest.fn(id => {
      return { affected:1, generatedMaps:[], raw:[] } as UpdateResult
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LanesController],
      providers: [
        {
          provide: LanesService,
          useValue: mockLanesService,
        },
        {
          provide: APP_GUARD,
          useClass: JwtAuthGuard,
        },
      ],
    }).compile();

    controller = module.get<LanesController>(LanesController);
    service = module.get<LanesService>(LanesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new lane', async () => {
      const createLaneDto: CreateLaneDto = { name: 'Test Lane', boardId: 1, order: 1, status: 1 };
      const result = await controller.create(createLaneDto);

      expect(result).toEqual({
        id: expect.any(Number),
        ...createLaneDto,
      });
      expect(service.create).toHaveBeenCalledWith(createLaneDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of lanes', async () => {
      const result = await controller.findAll();

      expect(result).toEqual([
        { id:1, name: 'Test Lane', boardId: 1, order: 1, status: 1 },
        { id:1, name: 'Test Lane', boardId: 1, order: 1, status: 1 },
      ]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single lane', async () => {
      const result = await controller.findOne('1');

      expect(result).toEqual({ id: 1, name: 'Test Lane',order:1, status:1, boardId:1});
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a lane', async () => {
      const updateLaneDto: UpdateLaneDto = { name: 'Updated Lane' };
      const result = await controller.update('1', updateLaneDto);

      expect(result).toEqual({ affected:1, generatedMaps:[], raw:[] } as UpdateResult);
      expect(service.update).toHaveBeenCalledWith(1, updateLaneDto);
    });
  });

  describe('remove', () => {
    it('should remove a lane', async () => {
      const result = await controller.remove('1');

      expect(result).toEqual({ affected:1, generatedMaps:[], raw:[] } as UpdateResult);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});