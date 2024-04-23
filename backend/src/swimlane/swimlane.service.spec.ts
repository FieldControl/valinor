import { Test, TestingModule } from '@nestjs/testing';
import { SwimlaneService } from './swimlane.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Swimlane } from './entities/swimlane.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';

describe('SwimlaneService', () => {
  let service: SwimlaneService;
  let mockSwimlaneRepository: Partial<Repository<Swimlane>>;
  let mockUserService: Partial<UserService>;

  beforeEach(async () => {
    mockSwimlaneRepository = {
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    };

    mockUserService = {
      isConnectedToBoard: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SwimlaneService,
        {
          provide: getRepositoryToken(Swimlane),
          useValue: mockSwimlaneRepository,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    service = module.get<SwimlaneService>(SwimlaneService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
