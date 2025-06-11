import { Test, TestingModule } from '@nestjs/testing';
import { ColumnsService } from '../columns/columns.service';
import { PrismaService } from '../prisma/prisma.service';
import { Column } from '@prisma/client';

describe('ColumnsService', () => {
  let service: ColumnsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ColumnsService, PrismaService],
    }).compile();

    service = module.get<ColumnsService>(ColumnsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('deve criar coluna', async () => {
    const now = new Date();
    const fakeColumn: Column = {
      id: 1,
      title: 'Teste',
      order: 0,
      createdAt: now,
      updatedAt: now,
    };

    jest.spyOn(prisma.column, 'create').mockResolvedValue(fakeColumn);

    const col = await service.create({ title: 'Teste', order: 0 });
    expect(col.title).toBe('Teste');
  });
});
