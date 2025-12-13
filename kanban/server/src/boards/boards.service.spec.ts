import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { PrismaService } from '../prisma/prisma.service';

describe('BoardsService', () => {
  let service: BoardsService;

  let prismaBoardMock: {
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(async () => {
    prismaBoardMock = {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const prismaMock = {
      board: prismaBoardMock,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<BoardsService>(BoardsService);
  });

  it('deve criar um board', async () => {
    const dto = { name: 'Meu board' };
    const created = { id: '1', name: 'Meu board' };

    prismaBoardMock.create.mockResolvedValue(created);

    const result = await service.create(dto as any);

    expect(result).toEqual(created);
    expect(prismaBoardMock.create).toHaveBeenCalledWith({
      data: { name: dto.name },
    });
  });

  it('deve lançar NotFoundException no findOneOrThrow quando board não existir', async () => {
    prismaBoardMock.findUnique.mockResolvedValue(null);

    await expect(service.findOneOrThrow('1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('deve atualizar um board (update)', async () => {
    const existing = { id: '1', name: 'Antigo' };
    const dto = { name: 'Atualizado' };

    prismaBoardMock.findUnique.mockResolvedValue(existing);
    prismaBoardMock.update.mockResolvedValue({
      ...existing,
      name: dto.name,
    });

    const result = await service.update('1', dto as any);

    expect(prismaBoardMock.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { name: dto.name },
    });
    expect(result.name).toBe('Atualizado');
  });

  it('deve remover um board (remove)', async () => {
    const existing = { id: '1', name: 'Board' };

    prismaBoardMock.findUnique.mockResolvedValue(existing);
    prismaBoardMock.delete.mockResolvedValue(existing);

    const result = await service.remove('1');

    expect(prismaBoardMock.delete).toHaveBeenCalledWith({
      where: { id: '1' },
    });
    expect(result).toEqual(existing);
  });
});
