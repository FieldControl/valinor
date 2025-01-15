import { Test, TestingModule } from '@nestjs/testing';
import { KanbanController } from './kanban.controller';
import { KanbanService } from './kanban.service';

describe('KanbanController', () => {
  let controller: KanbanController;
  let service: KanbanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KanbanController],
    }).compile();

    controller = module.get<KanbanController>(KanbanController);
    service = module.get<KanbanService>(KanbanService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a board', async () => {
    const createBoardSpy = jest.spyOn(service, 'createBoard').mockResolvedValue({
      id: '1',
      title: 'Test Board',
      createdAt: new Date(),
    });
    const result = await controller.createBoard('Test Board');
    expect(createBoardSpy).toHaveBeenCalledWith('Test Board');
    expect(result).toEqual({
      id: '1',
      title: 'Test Board',
      createdAt: new Date(),
    });
  });
});
