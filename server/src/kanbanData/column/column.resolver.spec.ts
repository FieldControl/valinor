import { Test, TestingModule } from '@nestjs/testing';
import { ColumnResolver } from './column.resolver';
import { ColumnService } from './column.service';
import { TaskService } from '../task/task.service';
import { CreateColumnInput } from './create-column.input';

const mockColumn = {
  id: '1',
  name: 'Column Test',
  color: 'blue',
};

const mockColumnService = {
  create: jest.fn().mockResolvedValue({
    _id: '1',
    name: 'Column Test',
    color: 'blue',
  }),
  findAll: jest.fn().mockResolvedValue([mockColumn]),
  remove: jest.fn().mockResolvedValue(true),
};

const mockTaskService = {
  removeMany: jest.fn().mockResolvedValue(true),
};

describe('ColumnResolver', () => {
  let resolver: ColumnResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ColumnResolver,
        { provide: ColumnService, useValue: mockColumnService },
        { provide: TaskService, useValue: mockTaskService },
      ],
    }).compile();

    resolver = module.get<ColumnResolver>(ColumnResolver);
  });

  it('deve criar uma coluna', async () => {
    const input: CreateColumnInput = { name: 'Column Test', color: 'blue' };
    const result = await resolver.createColumn(input);

    expect(mockColumnService.create).toHaveBeenCalledWith(input);
    expect(result).toEqual(mockColumn);
  });

  it('deve buscar todas as colunas', async () => {
    const result = await resolver.getAllColumns();

    expect(mockColumnService.findAll).toHaveBeenCalled();
    expect(result).toEqual([mockColumn]);
  });

  it('deve deletar uma coluna e suas tarefas associadas', async () => {
    const result = await resolver.deleteColumn('1');

    expect(mockTaskService.removeMany).toHaveBeenCalledWith('1');
    expect(mockColumnService.remove).toHaveBeenCalledWith('1');
    expect(result).toBe(true);
  });
});
