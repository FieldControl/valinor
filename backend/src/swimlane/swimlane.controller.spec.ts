import { Test, TestingModule } from '@nestjs/testing';
import { SwimlaneController } from './swimlane.controller';
import { SwimlaneService } from './swimlane.service';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from 'src/auth/auth/auth.guard';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Swimlane } from './entities/swimlane.entity';
import { UserService } from 'src/user/user.service'; // Asegure-se de que esta é a importação correta

describe('SwimlaneController', () => {
  let controller: SwimlaneController;
  let mockJwtService: any;
  let mockUserService: any;

  beforeEach(async () => {
    mockJwtService = {
      verifyAsync: jest.fn(),
      signAsync: jest.fn(),
      sign: jest.fn(),
      verify: jest.fn(),
      decode: jest.fn(),
      options: {},
      getSecretKey: jest.fn().mockReturnValue('secret'),
      mergeJwtOptions: jest.fn(),
      overrideSecretFromOptions: jest.fn(),
      logger: {
        log: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
        verbose: jest.fn(),
      },
    };

    mockUserService = {
      // Mock métodos utilizados por SwimlaneService que dependem de UserService
      getUserById: jest.fn().mockResolvedValue({ id: 1, name: 'User' }),
      // Adicione outros métodos conforme necessário
    };

    const mockSwimlaneRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SwimlaneController],
      providers: [
        SwimlaneService,
        {
          provide: getRepositoryToken(Swimlane),
          useValue: mockSwimlaneRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: UserService,
          useValue: mockUserService, // Fornecendo mockUserService
        },
        AuthGuard,
      ],
    }).compile();

    controller = module.get<SwimlaneController>(SwimlaneController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
