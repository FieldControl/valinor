import { Test, TestingModule } from '@nestjs/testing';
import { CardController } from './card.controller';
import { CardService } from './card.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Card } from './entities/card.entity';
import { Repository } from 'typeorm';
import { SwimlaneService } from 'src/swimlane/swimlane.service';
import { UserService } from 'src/user/user.service';
import { AuthGuard } from 'src/auth/auth/auth.guard';
import { JwtService } from '@nestjs/jwt';

describe('CardController', () => {
  let controller: CardController;
  let mockCardRepository: Partial<Repository<Card>>;
  let mockSwimlaneService: Partial<SwimlaneService>;
  let mockUserService: Partial<UserService>;
  let mockJwtService: Partial<JwtService>;

  beforeEach(async () => {
    mockCardRepository = {
      save: jest
        .fn()
        .mockImplementation((card) =>
          Promise.resolve({ ...card, id: Date.now() }),
        ),
      findOne: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      create: jest.fn().mockImplementation((card) => card),
    };

    mockSwimlaneService = {
      hasAccessToSwimlane: jest.fn().mockResolvedValue(true),
    };

    mockUserService = {
      isConnectedToBoard: jest.fn().mockResolvedValue(true),
    };

    mockJwtService = {
      verifyAsync: jest.fn().mockResolvedValue({ userId: 1 }),
      signAsync: jest.fn(),
      sign: jest.fn(),
      verify: jest.fn(),
      decode: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CardController],
      providers: [
        CardService,
        {
          provide: getRepositoryToken(Card),
          useValue: mockCardRepository,
        },
        {
          provide: SwimlaneService,
          useValue: mockSwimlaneService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        AuthGuard,
      ],
    }).compile();

    controller = module.get<CardController>(CardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
