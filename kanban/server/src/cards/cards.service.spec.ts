import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CardsService } from './cards.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CardsService', () => {
  let service: CardsService;

  let prismaColumnMock: {
    findUnique: jest.Mock;
  };

  let prismaCardMock: {
    findMany: jest.Mock;
    create: jest.Mock;
    findUnique: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    aggregate: jest.Mock;
  };

  beforeEach(async () => {
    prismaColumnMock = {
      findUnique: jest.fn(),
    };

    prismaCardMock = {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      aggregate: jest.fn(),
    };

    const prismaMock = {
      column: prismaColumnMock,
      card: prismaCardMock,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<CardsService>(CardsService);
  });

  it('deve lançar NotFoundException ao criar card se coluna não existir', async () => {
    prismaColumnMock.findUnique.mockResolvedValue(null);

    await expect(
      service.create('col-1', { title: 'Task' } as any),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('deve criar card com ordem automática e dueDate', async () => {
    prismaColumnMock.findUnique.mockResolvedValue({ id: 'col-1' });

    prismaCardMock.aggregate.mockResolvedValue({
      _max: { order: null },
    });

    const dto = {
      title: 'Task',
      description: 'Teste',
      dueDate: '2025-12-15T18:00:00.000Z',
    };

    const created = {
      id: 'card-1',
      title: dto.title,
      description: dto.description,
      order: 0,
      columnId: 'col-1',
      dueDate: new Date(dto.dueDate),
    };

    prismaCardMock.create.mockResolvedValue(created);

    const result = await service.create('col-1', dto as any);

    expect(result).toEqual(created);

    expect(prismaCardMock.aggregate).toHaveBeenCalledWith({
      where: { columnId: 'col-1' },
      _max: { order: true },
    });

    // pega o argumento que foi passado para create
    const callArg = prismaCardMock.create.mock.calls[0][0];

    expect(callArg.data.title).toBe(dto.title);
    expect(callArg.data.description).toBe(dto.description);
    expect(callArg.data.columnId).toBe('col-1');
    expect(callArg.data.order).toBe(0);
    expect(callArg.data.dueDate).toEqual(new Date(dto.dueDate));
  });

  it('deve listar cards por coluna (findByColumn)', async () => {
    const cards = [
      { id: 'card-1', title: 'Task 1', order: 0 },
      { id: 'card-2', title: 'Task 2', order: 1 },
    ];

    prismaCardMock.findMany.mockResolvedValue(cards);

    const result = await service.findByColumn('col-1');

    expect(result).toEqual(cards);
    expect(prismaCardMock.findMany).toHaveBeenCalledWith({
      where: { columnId: 'col-1' },
      orderBy: { order: 'asc' },
    });
  });

  it('deve atualizar um card (update)', async () => {
    const existing = { id: 'card-1', title: 'Velho', order: 0 };
    const dto = { title: 'Novo título' };

    prismaCardMock.findUnique.mockResolvedValue(existing);
    prismaCardMock.update.mockResolvedValue({
      ...existing,
      title: dto.title,
    });

    const result = await service.update('card-1', dto as any);

    expect(prismaCardMock.update).toHaveBeenCalledWith({
      where: { id: 'card-1' },
      data: { title: dto.title },
    });
    expect(result.title).toBe(dto.title);
  });

  it('deve remover um card (remove)', async () => {
    const existing = { id: 'card-1', title: 'Task', order: 0 };

    prismaCardMock.findUnique.mockResolvedValue(existing);
    prismaCardMock.delete.mockResolvedValue(existing);

    const result = await service.remove('card-1');

    expect(prismaCardMock.delete).toHaveBeenCalledWith({
      where: { id: 'card-1' },
    });
    expect(result).toEqual(existing);
  });
});
