import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

describe('UserService', () => {
  let service: UserService;
  let mockUserRepository: Partial<Repository<User>>;

  beforeEach(async () => {
    // Criar um mock para UserRepository
    mockUserRepository = {
      save: jest
        .fn()
        .mockImplementation((user) =>
          Promise.resolve({ ...user, id: Date.now() }),
        ),
      findOneBy: jest.fn().mockImplementation(({ id }) =>
        Promise.resolve({
          id,
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
        }),
      ),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
