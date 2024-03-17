import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import TesteUtil from './../common/test/TestUtil';
import { User } from './user.entity';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  beforeEach(() => {
    mockRepository.find.mockReset();
    mockRepository.findOne.mockReset();
    mockRepository.create.mockReset();
    mockRepository.save.mockReset();
    mockRepository.update.mockReset();
    mockRepository.remove.mockReset();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('When search all Users', () => {
    it('should be list all users', async () => {
      const user = TesteUtil.giveAMeAValidUser();
      mockRepository.find.mockReturnValue([user, user]);
      const users = await service.findAllUsers();

      expect(users).toHaveLength(2);
      expect(mockRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('When search User By Email', () => {
    it('should find a existing user', async () => {
      const user = TesteUtil.giveAMeAValidUser();
      mockRepository.findOne.mockReturnValue(user);
      const userFound = await service.findUserByEmail('johndoe@email.com');

      expect(userFound).toMatchObject({ name: user.name });
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    });

    it('should return a expection when does not find a user', async () => {
      mockRepository.findOne.mockReturnValue(null);

      expect(service.findUserByEmail('john@email.com')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('When search User By Id', () => {
    it('should find a existing user', async () => {
      const user = TesteUtil.giveAMeAValidUser();
      mockRepository.findOne.mockReturnValue(user);
      const userFound = await service.findUserById('1');

      expect(userFound).toMatchObject({ name: user.name });
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    });

    it('should return a expection when does not find a user', async () => {
      mockRepository.findOne.mockReturnValue(null);

      expect(service.findUserById('3')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('When create user', () => {
    it('should create a user', async () => {
      const user = TesteUtil.giveAMeAValidUser();
      mockRepository.save.mockReturnValue(user);
      mockRepository.create.mockReturnValue(user);

      const savedUser = await service.createUser(user);
      expect(savedUser).toMatchObject(user);
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
      expect(mockRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should return a expection when doesnt create a user', async () => {
      const user = TesteUtil.giveAMeAValidUser();
      mockRepository.save.mockReturnValue(null);
      mockRepository.create.mockReturnValue(user);

      await service.createUser(user).catch((e) => {
        expect(e).toBeInstanceOf(InternalServerErrorException);
        expect(e).toMatchObject({
          message: 'Error when creating a new user.',
        });
        expect(mockRepository.save).toHaveBeenCalledTimes(1);
        expect(mockRepository.create).toHaveBeenCalledTimes(1);
      });
    });

    it('should return an expectation when the email already exists', async () => {
      const user = TesteUtil.giveAMeAValidUser();
      mockRepository.findOne.mockReturnValue(user);

      await service.createUser(user).catch((e) => {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e).toMatchObject({
          message: 'E-mail already registered.',
        });
      });
    });
  });

  describe('When update User', () => {
    it('should update a user', async () => {
      const user = TesteUtil.giveAMeAValidUser();
      const newUserUpdate = {
        name: 'John Doe2',
        email: 'teste@teste.com',
      };

      const userUpdate = {
        ...user,
        ...newUserUpdate,
      };

      mockRepository.findOne.mockReturnValue(user);
      mockRepository.save.mockReturnValue(userUpdate);

      const resultUser = await service.updateUser('1', newUserUpdate);

      expect(resultUser.name).toEqual(userUpdate.name);
      expect(resultUser.email).toEqual(userUpdate.email);
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('When delete User', () => {
    it('Should delete a existing user', async () => {
      const user = TesteUtil.giveAMeAValidUser();
      mockRepository.findOne.mockReturnValue(user);
      mockRepository.remove.mockReturnValue(user);

      const deletedUser = await service.deleteUser('1');

      expect(deletedUser).toBe(true);
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockRepository.remove).toHaveBeenCalledTimes(1);
    });

    it('Should not delete a inexisting user', async () => {
      const user = TesteUtil.giveAMeAValidUser();
      mockRepository.findOne.mockReturnValue(user);
      mockRepository.remove.mockReturnValue(null);

      const deletedUser = await service.deleteUser('9');

      expect(deletedUser).toBe(false);
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockRepository.remove).toHaveBeenCalledTimes(1);
    });
  });
});
