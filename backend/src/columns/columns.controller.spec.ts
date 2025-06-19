import { Test, TestingModule } from '@nestjs/testing';
import { ColumnsController } from './columns.controller';
import { ColumnsService } from './columns.service';

describe('ColumnsController', () => {
  let controller: ColumnsController;

  const mockColumnsService = {
    findAll: jest.fn().mockResolvedValue([]),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ColumnsController],
      providers: [{ provide: ColumnsService, useValue: mockColumnsService }],
    }).compile();

    controller = module.get<ColumnsController>(ColumnsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return an array of columns', async () => {
    expect(await controller.findAll()).toEqual([]);
    expect(mockColumnsService.findAll).toHaveBeenCalled();
  });
});