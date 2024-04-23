import { Test, TestingModule } from '@nestjs/testing';
import { CardService } from './card.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Card } from './entities/card.entity';
import { Repository } from 'typeorm';
import { SwimlaneService } from 'src/swimlane/swimlane.service';
import { UserService } from 'src/user/user.service';

describe('CardService', () => {
  let service: CardService;
  let mockCardRepository: Partial<Repository<Card>>;
  let mockSwimlaneService: Partial<SwimlaneService>;
  let mockUserService: Partial<UserService>;

  beforeEach(async () => {
    // Mock para CardRepository
    mockCardRepository = {
      save: jest.fn(),
      findOneBy: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    // Mock para SwimlaneService
    mockSwimlaneService = {
      hasAccessToSwimlane: jest.fn().mockResolvedValue(true),
    };

    // Mock para UserService
    mockUserService = {
      isConnectedToBoard: jest.fn().mockResolvedValue(true),
      isConnectedToSwimlane: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
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
      ],
    }).compile();

    service = module.get<CardService>(CardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
