import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Lane } from '../lanes/entities/lane.entity';
import { Task } from '../tasks/entities/task.entity';
import { Board } from '../boards/entities/board.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

const mockUserRepository = () => ({
  insert: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn()
});

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],

      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useFactory: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should hash the password and save the user', async () => {
      const createUserDto = { username: 'test', password: 'password' };
      const hashedPassword = 'hashedPassword';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      jest.spyOn(repository, 'insert').mockResolvedValue({
        generatedMaps: [{
          id: 1,
          status: 1
        }]
      } as any);

      let response = await service.create(createUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
      expect(repository.insert).toHaveBeenCalledWith({
        ...createUserDto,
        password: hashedPassword,
      });
      expect(response.generatedMaps).toHaveLength(1);
      expect(response.generatedMaps[0].id).toBe(1);
      expect(response.generatedMaps[0].status).toBe(1);
    });
  });
  describe('findByUsername', () => {
    it('should return the user', async () => {
      const user = { id: 1, username: 'test', password: 'password' } as User;
      jest.spyOn(repository, 'findOne').mockResolvedValue(user);

      const result = await service.findOneByUsername('test');

      expect(result).toEqual(user);
      expect(repository.findOne).toHaveBeenCalled();
    });
  });
  describe('findOne', () => {
    it('should return the user', async () => {
      const user = { id: 1, username: 'test', password: 'password' } as User;
      jest.spyOn(repository, 'findOne').mockResolvedValue(user);

      const result = await service.findOne(user.id);

      expect(result).toEqual(user);
      expect(repository.findOne).toHaveBeenCalled();
    });
  });
  describe('update', () => {
    it('should update the user', async () => {
      const updateUserDto = { username: 'test', password: 'password' };
      jest.spyOn(repository, 'update').mockResolvedValue({ affected: 1 } as any);

      const result = await service.update(1, updateUserDto);

      expect(repository.update).toHaveBeenCalledWith(1, updateUserDto);
      expect(result).toEqual({ affected: 1 });

    });
  });
  describe('remove', () => {
    it('should soft delete the user', async () => {
      const updateUserDto = {id:1, username: 'test', password: 'password' };
      jest.spyOn(repository, 'update').mockResolvedValue({ affected: 1 } as any);

      const result = await service.remove(1);
      expect(repository.update).toHaveBeenCalled();
      expect(result).toEqual({ affected: 1 });

    });
  });
  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [{ id: 1, username: 'test', password: 'password' }] as User[];
      jest.spyOn(repository, 'find').mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toEqual(users);
      expect(repository.find).toHaveBeenCalled();
    });
  });
});