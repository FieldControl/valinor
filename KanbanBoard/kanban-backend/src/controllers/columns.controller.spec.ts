import { Test, TestingModule } from '@nestjs/testing';
import { ColumnsController } from './columns.controller';
import { ColumnsService } from '../services/columns.service';

describe('ColumnsController', () => {
  let controller: ColumnsController;
  let service: ColumnsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ColumnsController],
      providers: [
        {
          provide: ColumnsService,
          useValue: {
            findAll: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ColumnsController>(ColumnsController);
    service = module.get<ColumnsService>(ColumnsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all columns (findAll)', async () => {
    const mockColumns = [{ id: 1, title: 'Column 1', cards: [] }];
    jest.spyOn(service, 'findAll').mockResolvedValue(mockColumns);

    expect(await controller.findAll()).toEqual(mockColumns);
  });

  it('should create a new column', async () => {
    const body = { title: 'Column 1' };
    const mockColumn = { id: 1, ...body, cards: [] };
    jest.spyOn(service, 'create').mockResolvedValue(mockColumn);

    expect(await controller.create(body)).toEqual(mockColumn);
  });

  it('should delete a column', async () => {
    const id = 1;
    const mockResult = { message: 'Column deleted successfully' };
    jest.spyOn(service, 'delete').mockResolvedValue(mockResult);

    expect(await controller.delete(id)).toEqual(mockResult);
  });
});
