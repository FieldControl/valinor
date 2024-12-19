import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ColumnService } from './column.service';
import { Column } from './column.schema';
import { CreateColumnInput } from './create-column.input';

const mockColumn = {
  _id: '1',
  name: 'Column Test',
  color: 'blue',
};

const mockColumnModel = {
  create: jest.fn().mockResolvedValue(mockColumn), // Mock do método create
  find: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue([mockColumn]),
  }),
  deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
};

describe('ColumnService', () => {
  let service: ColumnService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ColumnService,
        { provide: getModelToken(Column.name), useValue: mockColumnModel },
      ],
    }).compile();

    service = module.get<ColumnService>(ColumnService);
  });

  it('deve buscar todas as colunas', async () => {
    const result = await service.findAll();

    expect(mockColumnModel.find).toHaveBeenCalled();
    expect(result).toEqual([{ id: '1', name: 'Column Test', color: 'blue' }]);
  });

  it('deve deletar uma coluna', async () => {
    const result = await service.remove('1');

    expect(mockColumnModel.deleteOne).toHaveBeenCalledWith({ _id: '1' });
    expect(result).toBe(true);
  });
});
