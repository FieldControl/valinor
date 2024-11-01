import { Test, TestingModule } from '@nestjs/testing';
import { CardController } from './card.controller';
import { CardService } from './card.service';
import { CreateCardDto } from './dto/create-card.dto';
import { JwtModule } from '@nestjs/jwt';
import { PayloadRequest } from 'src/auth/auth/auth.guard';

describe('CardController', () => {
  let controller: CardController;
  let cardService: CardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'testSecret', // Use uma chave secreta apropriada para os testes
          signOptions: { expiresIn: '60s' },
        }),
      ],
      controllers: [CardController],
      providers: [
        {
          provide: CardService,
          useValue: {
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            updateCardOrdersAndSwimlanes: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CardController>(CardController);
    cardService = module.get<CardService>(CardService);
  });

  describe('create', () => {
    it('should create a new card', async () => {
      const createCardDto: CreateCardDto = {
        name: 'New Card',
        content: 'Card description',
        order: 1,
        swimlaneId: 1,
      };
      const userId = 1;

      const result = { id: 1, ...createCardDto };
      cardService.create = jest.fn().mockResolvedValue(result);

      const req: Partial<PayloadRequest> = {
        user: {
          email: 'user@example.com',
          id: userId,
        },
      };

      expect(await controller.create(createCardDto, req as PayloadRequest)).toEqual(result);
      expect(cardService.create).toHaveBeenCalledWith(createCardDto, userId);
    });
  });

  // Adicione mais testes para update, remove e outras funcionalidades
});
