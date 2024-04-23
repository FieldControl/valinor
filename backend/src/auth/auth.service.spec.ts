import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';

describe('AuthService', () => {
  let service: AuthService;
  let mockUserRepository: Partial<Repository<User>>;
  let mockJwtService: Partial<JwtService>;

  beforeEach(async () => {
    mockUserRepository = {
      findOne: jest.fn().mockResolvedValue({
        id: 1,
        email: 'user@example.com',
        password: '$2b$10$examplehash',
      }),
    };

    mockJwtService = {
      signAsync: jest.fn().mockResolvedValue('fake-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
