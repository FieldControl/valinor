import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { ColumnsResolver } from './columns.resolver.js';
import { ColumnsService } from './columns.service.js';

const mockColumnsService = {
  create: jest.fn((dto) => ({ id: 1, ...dto })),
  findAll: jest.fn(() => []),
  update: jest.fn((id, dto) => ({ id, ...dto })),
  remove: jest.fn((id) => ({ id, isArchived: true })),
};

describe('ColumnsResolver', () => {
  let resolver: ColumnsResolver;
  let service: ColumnsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ColumnsResolver,
        { provide: ColumnsService, useValue: mockColumnsService },
      ],
    }).compile();

    resolver = module.get<ColumnsResolver>(ColumnsResolver);
    service = module.get<ColumnsService>(ColumnsService);
  });

  it('deve criar uma coluna via mutation', async () => {
    const dto = { title: 'To Do', boardId: 1 };
    const result = await resolver.createColumn(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ id: 1, title: 'To Do', boardId: 1 });
  });

  it('deve remover uma coluna (arquivar)', async () => {
    const result = await resolver.removeColumn(10);
    expect(service.remove).toHaveBeenCalledWith(10);
    expect(result.isArchived).toBe(true);
  });

  it('deve atualizar um card (mover)', async () => {
    const dto = { id: 1, boardId: 1, title: 'To Do - Alterado' };
    await resolver.updateColumn(dto);
    expect(service.update).toHaveBeenCalledWith(1, dto);
  });
});
