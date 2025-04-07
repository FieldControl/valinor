import { Test, TestingModule } from '@nestjs/testing';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';

const mockBoardService = {
  getColumns: jest.fn(),
  createColumn: jest.fn(),
  createCard: jest.fn(),
};

describe('BoardController', () => {
  let controller: BoardController;
  let service: BoardService;
  let module: TestingModule; // Declarando module no escopo do describe

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [BoardController],
      providers: [
        {
          provide: BoardService,
          useValue: mockBoardService,
        },
      ],
    }).compile();

    controller = module.get<BoardController>(BoardController);
    service = module.get<BoardService>(BoardService);
  });

  afterAll(async () => {
    await module?.close(); // Fechando o módulo após os testes
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
