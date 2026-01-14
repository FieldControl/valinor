import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ColumnsService } from './columns.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ColumnsService', () => {
  let service: ColumnsService;

  let prismaBoardMock: {
    findUnique: jest.Mock;
  };

  let prismaColumnMock: {
    findMany: jest.Mock;
    create: jest.Mock;
    findUnique: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    aggregate: jest.Mock;
  };

  beforeEach(async () => {
    prismaBoardMock = {
      findUnique: jest.fn(),
    };

    prismaColumnMock = {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      aggregate: jest.fn(),
    };

    const prismaMock = {
      board: prismaBoardMock,
      column: prismaColumnMock,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ColumnsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<ColumnsService>(ColumnsService);
  });

  it('deve lançar NotFoundException ao criar coluna se board não existir', async () => {
    prismaBoardMock.findUnique.mockResolvedValue(null);

    await expect(
      service.create('board-id', { title: 'To Do' } as any),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('deve criar coluna com ordem automática quando order não for informado', async () => {
    prismaBoardMock.findUnique.mockResolvedValue({ id: 'board-id' });

    prismaColumnMock.aggregate.mockResolvedValue({
      _max: { order: null },
    });

    const created = {
      id: 'col-1',
      title: 'To Do',
      order: 0,
      boardId: 'board-id',
    };

    prismaColumnMock.create.mockResolvedValue(created);

    const dto = { title: 'To Do' }; // sem order
    const result = await service.create('board-id', dto as any);

    expect(result).toEqual(created);
    expect(prismaColumnMock.aggregate).toHaveBeenCalledWith({
      where: { boardId: 'board-id' },
      _max: { order: true },
    });
    expect(prismaColumnMock.create).toHaveBeenCalledWith({
      data: {
        title: dto.title,
        order: 0,
        boardId: 'board-id',
      },
    });
  });

  it('deve listar colunas por board (findByBoard)', async () => {
    const columns = [
      { id: 'c1', title: 'To Do', order: 0 },
      { id: 'c2', title: 'Doing', order: 1 },
    ];

    prismaColumnMock.findMany.mockResolvedValue(columns);

    const result = await service.findByBoard('board-id');

    expect(result).toEqual(columns);
    expect(prismaColumnMock.findMany).toHaveBeenCalledWith({
      where: { boardId: 'board-id' },
      orderBy: { order: 'asc' },
      include: {
        cards: { orderBy: { order: 'asc' } },
      },
    });
  });

  it('deve atualizar uma coluna (update)', async () => {
    const existing = { id: 'col-1', title: 'Antigo', order: 0 };
    const dto = { title: 'Novo' };

    prismaColumnMock.findUnique.mockResolvedValue(existing);
    prismaColumnMock.update.mockResolvedValue({
      ...existing,
      title: dto.title,
    });

    const result = await service.update('col-1', dto as any);

    expect(prismaColumnMock.update).toHaveBeenCalledWith({
      where: { id: 'col-1' },
      data: { title: dto.title },
    });
    expect(result.title).toBe('Novo');
  });

  it('deve remover uma coluna (remove)', async () => {
    const existing = { id: 'col-1', title: 'Teste', order: 0 };

    prismaColumnMock.findUnique.mockResolvedValue(existing);
    prismaColumnMock.delete.mockResolvedValue(existing);

    const result = await service.remove('col-1');

    expect(prismaColumnMock.delete).toHaveBeenCalledWith({
      where: { id: 'col-1' },
    });
    expect(result).toEqual(existing);
  });
});
