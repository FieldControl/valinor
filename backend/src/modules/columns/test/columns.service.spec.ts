import { Test, TestingModule } from "@nestjs/testing";
import { Column } from "@prisma/client";
import { PrismaService } from "../../../database/prisma.service";
import { ColumnsService } from "../columns.service";
import { CreateColumnDto } from "../dto/create-column.dto";
import { UpdateColumnDto } from "../dto/update-column.dto";

describe('ColumnsService', () => {
  let service: ColumnsService;
  let prisma: PrismaService;

  const mockPrisma = {
    column: {
      findFirst: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ColumnsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ColumnsService>(ColumnsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve calcular posição a partir da última coluna existente e criar', async () => {
      const dto: CreateColumnDto = { title: 'C1' };

      mockPrisma.column.findFirst.mockResolvedValue({ position: 2 } as Partial<Column>);
      mockPrisma.column.create.mockResolvedValue({
        id: 1,
        title: 'C1',
        position: 3,
      } as Column);

      const column = await service.create(dto);

      expect(mockPrisma.column.findFirst).toHaveBeenCalledWith({
        select: { position: true },
        orderBy: { position: 'desc' },
      });

      expect(mockPrisma.column.create).toHaveBeenCalledWith({
        data: { ...dto, position: 3 },
      });

      expect(column).toEqual({
        id: 1,
        title: 'C1',
        position: 3,
      } as Column);
    });

    it('deve posicionar como 1 quando não há colunas existentes', async () => {
      mockPrisma.column.findFirst.mockResolvedValue(null);
      const dto: CreateColumnDto = { title: 'Primeira' };

      mockPrisma.column.create.mockResolvedValue({
        id: 1,
        title: 'C1',
        position: 1,
      } as Column);

      const res = await service.create(dto);

      expect(mockPrisma.column.create).toHaveBeenCalledWith({
        data: { ...dto, position: 1 },
      });

      expect(res.position).toBe(1);
    });
  });

  describe('createMany', () => {
    it('deve criar múltiplas colunas com posições sequenciais após a última existente', async () => {
      const input: CreateColumnDto[] = [{ title: 'C1' }, { title: 'C2' }];

      mockPrisma.column.findFirst.mockResolvedValue({ position: 2 } as Partial<Column>);
      mockPrisma.column.createMany.mockResolvedValue({ count: 2 });

      const res = await service.createMany(input);

      expect(mockPrisma.column.findFirst).toHaveBeenCalledWith({
        select: { position: true },
        orderBy: { position: 'desc' },
      });

      expect(mockPrisma.column.createMany).toHaveBeenCalledWith({
        data: [
          { title: 'C1', position: 3 },
          { title: 'C2', position: 4 },
        ] as Column[],
      });

      expect(res).toEqual([
        { title: 'C1', position: 3 },
        { title: 'C2', position: 4 },
      ] as Column[]);
    });

    it('deve começar em 1 quando não há colunas existentes', async () => {
      const input: CreateColumnDto[] = [{ title: 'X' }];

      mockPrisma.column.findFirst.mockResolvedValue(null);
      mockPrisma.column.createMany.mockResolvedValue({ count: 1 });

      const res = await service.createMany(input);

      expect(mockPrisma.column.createMany).toHaveBeenCalledWith({
        data: [{ title: 'X', position: 1 }] as Column[],
      });

      expect(res).toEqual([{ title: 'X', position: 1 }] as Column[]);
    });
  });

  describe('listWithCards', () => {
    it('deve retornar colunas incluindo cards ordenados', async () => {
      const expected = [
        { id: 1, title: 'A', cards: [{ id: 10, position: 1 }] },
      ];

      mockPrisma.column.findMany.mockResolvedValue(expected);

      const res = await service.listWithCards();

      expect(mockPrisma.column.findMany).toHaveBeenCalledWith({
        include: { cards: { orderBy: { position: 'asc' } } },
      });

      expect(res).toBe(expected);
    });
  });

  describe('update', () => {
    it('deve chamar prisma.update com where e data corretos e retornar resultado', async () => {
      const updated: UpdateColumnDto = { id: 5, title: 'Atualizada' };
      mockPrisma.column.update.mockResolvedValue(updated);

      const res = await service.update(5, { title: 'Atualizada' });

      expect(mockPrisma.column.update).toHaveBeenCalledWith({
        where: { id: 5 },
        data: { title: 'Atualizada' },
      });

      expect(res).toBe(updated);
    });
  });

  describe('delete', () => {
    it('deve deletar coluna e retornar mensagem contendo o título', async () => {
      mockPrisma.column.delete.mockResolvedValue({ id: 7, title: 'Remover' } as Column);

      const res = await service.delete(7);

      expect(mockPrisma.column.delete).toHaveBeenCalledWith({ where: { id: 7 } });
      expect(res).toEqual({ message: 'Column [Remover] has been successfully deleted' });
    });
  });

  describe('deleteAll', () => {
    it('deve retornar mensagem quando não há colunas para deletar', async () => {
      mockPrisma.column.deleteMany.mockResolvedValue({ count: 0 });

      const res = await service.deleteAll();

      expect(mockPrisma.column.deleteMany).toHaveBeenCalledWith({});
      expect(res).toBe('There are no columns to delete');
    });

    it('deve retornar o resultado quando há colunas deletadas', async () => {
      const result = { count: 3 };
      mockPrisma.column.deleteMany.mockResolvedValue(result);

      const res = await service.deleteAll();

      expect(res).toBe(result);
    });
  });
});
