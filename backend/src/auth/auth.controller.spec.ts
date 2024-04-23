import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';

describe('AuthController', () => {
  let controller: AuthController;
  let mockUserService: Partial<UserService>;
  let mockJwtService: Partial<JwtService>;
  let mockUserRepository: Partial<Repository<User>>;

  beforeEach(async () => {
    mockJwtService = {
      signAsync: jest.fn().mockResolvedValue('mock-jwt-token'),
    };

    mockUserRepository = {
      findOne: jest.fn().mockResolvedValue({
        id: 1,
        email: 'user@example.com',
        password: 'hashedpassword',
      }),
      save: jest.fn().mockResolvedValue({
        id: 1,
        email: 'user@example.com',
      }),
    };

    mockUserService = {
      create: jest.fn().mockImplementation((dto) => ({
        ...dto,
        id: Date.now(), // Simulate user creation with a new ID
      })),
      findOne: jest.fn().mockResolvedValue({
        id: 1,
        email: 'user@example.com',
        password: 'hashedpassword',
      }),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
