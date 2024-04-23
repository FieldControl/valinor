import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from 'src/auth/auth/auth.guard';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

describe('UserController', () => {
  let controller: UserController;
  let mockJwtService: Partial<JwtService>;
  let mockUserRepository: Partial<Repository<User>>;

  beforeEach(async () => {
    mockJwtService = {
      signAsync: jest.fn().mockResolvedValue('mockToken'),
      verifyAsync: jest.fn().mockResolvedValue({ userId: 1 }),
      decode: jest.fn().mockReturnValue({ userId: 1 }),
    };

    mockUserRepository = {
      findOneBy: jest.fn().mockResolvedValue({
        id: 1,
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
      }),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
      save: jest.fn().mockResolvedValue({
        id: 1,
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        AuthGuard,
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
