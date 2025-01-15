import { Test, TestingModule } from '@nestjs/testing';
import { KanbanService } from './kanban.service';
import { PrismaService } from 'src/database/prisma.service';

describe('KanbanService', () => {
  let service: KanbanService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KanbanService],
    }).compile();

    service = module.get<KanbanService>(KanbanService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should create a board', async () => {
    const createBoardSpy = jest
      .spyOn(prisma.board, 'create')
      .mockResolvedValue({
        id: '1',
        title: 'Test Board',
        createdAt: new Date(),
      });
    const result = await service.createBoard('Test Board');
    expect(createBoardSpy).toHaveBeenCalledWith({
      data: { title: 'Test Board' },
    });
    expect(result).toEqual({
      id: '1',
      title: 'Test Board',
      createdAt: new Date(),
    });
  });
});
