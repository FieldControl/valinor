import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';

describe('UserService', () => {
  let service: UserService;
  let repository: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const mockRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('deve retornar o usuário fixo se o email for admin@gmail.com', async () => {
    const mockUser = { id: 1, email: 'admin@gmail.com', password: '1234' } as User;
    repository.findOne.mockResolvedValueOnce(mockUser);

    const result = await service.findByEmail('admin@gmail.com');
    expect(result).toEqual(mockUser);
    expect(repository.findOne).toHaveBeenCalledWith({ where: { email: 'admin@gmail.com' } });
  });

  it('deve retornar null se o email não for encontrado', async () => {
    repository.findOne.mockResolvedValueOnce(null);

    const result = await service.findByEmail('naoexiste@email.com');
    expect(result).toBeNull();
  });
});
