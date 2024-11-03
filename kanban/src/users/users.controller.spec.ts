import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Task } from '../tasks/entities/task.entity';
import { Lane } from '../lanes/entities/lane.entity';
import { Board } from '../boards/entities/board.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
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
describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;
  let repository: Repository<User>;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        
      ],
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useFactory: mockUserRepository,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));

  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should hash the password and save the user', async () => {
      const createUserDto = { username: 'test', password: 'password' };
      const hashedPassword = 'hashedPassword';
      jest.spyOn(service, "create").mockResolvedValue({
        generatedMaps: [{
          id: 1,
          status: 1
        }]
      } as any);

      let response = await controller.create(createUserDto);

      expect(service.create).toHaveBeenCalledWith({
        ...createUserDto,
        password: createUserDto.password,
      });
      expect(response.generatedMaps).toHaveLength(1);
      expect(response.generatedMaps[0].id).toBe(1);
      expect(response.generatedMaps[0].status).toBe(1);
    });
  });
  describe('findOne', () => {
    it('should return the user', async () => {
      const user = { id: 1, username: 'test', password: 'password' } as User;
      jest.spyOn(service, 'findOne').mockResolvedValue(user);

      const result = await controller.findOne(user.id.toString());

      expect(result).toEqual(user);
      expect(service.findOne).toHaveBeenCalled();
    });
  });
  describe('update', () => {
    it('should update the user', async () => {
      const updateUserDto = { username: 'test', password: 'password' };
      jest.spyOn(service, 'update').mockResolvedValue({ affected: 1 } as any);

      const result = await controller.update("1", updateUserDto);

      expect(service.update).toHaveBeenCalledWith(1, updateUserDto);
      expect(result).toEqual({ affected: 1 });

    });
  });
  describe('remove', () => {
    it('should soft delete the user', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue({ affected: 1 } as any);

      const result = await controller.remove("1");
      expect(service.remove).toHaveBeenCalled();
      expect(result).toEqual({ affected: 1 });

    });
  });
  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [{ id: 1, username: 'test', password: 'password' }] as User[];
      jest.spyOn(service, 'findAll').mockResolvedValue(users);

      const result = await controller.findAll();

      expect(result).toEqual(users);
      expect(service.findAll).toHaveBeenCalled();
    });
  });
});
