import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import TestUtil from 'src/common/util/testUtil';

describe('UserService', () => {
  let service: UserService;

  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  beforeEach(() => {
    mockPrismaService.user.findMany.mockReset();
    mockPrismaService.user.create.mockReset();
    mockPrismaService.user.findUnique.mockReset();
    mockPrismaService.user.update.mockReset();
    mockPrismaService.user.delete.mockReset();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllUsers', () => {
    it('should return an array of users', async () => {
      const user = TestUtil.giveMeAvalidUser();
      mockPrismaService.user.findMany.mockReturnValue([user, user]);
      const users = await service.findAllUsers();
      expect(users).toHaveLength(2);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('createUser', () => {
    it('should create and return a user', async () => {
      const user = TestUtil.giveMeAvalidUser();
      mockPrismaService.user.create.mockReturnValue(user);
      const createdUser = await service.createUser(user);
      expect(createdUser).toMatchObject(user);
      expect(mockPrismaService.user.create).toHaveBeenCalledTimes(1);
    });

    it('should throw an exception when it fails to create a user', async () => {
      const user = TestUtil.giveMeAvalidUser();
      mockPrismaService.user.create.mockRejectedValue(
        new InternalServerErrorException('Problem to create a user. Try again'),
      );

      try {
        await service.createUser(user);
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
        expect(e.message).toBe('Problem to create a user. Try again');
      }

      expect(mockPrismaService.user.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findUserByEmail', () => {
    it('should return a user by email', async () => {
      const user = TestUtil.giveMeAvalidUser();
      mockPrismaService.user.findUnique.mockReturnValue(user);
      const userFound = await service.findUserByEmail(user.email);
      expect(userFound).toMatchObject({ email: user.email });
    });

    it('should throw an exception when the user is not found by email', async () => {
      mockPrismaService.user.findUnique.mockReturnValue(null);
      await expect(
        service.findUserByEmail('null@null.com'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('findUserById', () => {
    it('should return a user by id', async () => {
      const user = TestUtil.giveMeAvalidUser();
      mockPrismaService.user.findUnique.mockReturnValue(user);
      const userFound = await service.findUserById(1);
      expect(userFound).toMatchObject({ name: user.name });
    });

    it('should throw an exception when the user is not found by id', async () => {
      mockPrismaService.user.findUnique.mockReturnValue(null);
      await expect(service.findUserById(3)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('updateUser', () => {
    it('should update and return the updated user', async () => {
      const updatedUser = TestUtil.giveMeAvalidUser();
      mockPrismaService.user.update.mockReturnValue(updatedUser);
      const result = await service.updateUser(updatedUser.id, {
        name: 'Updated Name',
      });
      expect(result).toEqual(updatedUser);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: updatedUser.id },
        data: { name: 'Updated Name' },
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete a user and return true', async () => {
      const user = TestUtil.giveMeAvalidUser();
      mockPrismaService.user.findUnique.mockReturnValue(user);
      mockPrismaService.user.delete.mockResolvedValue(user);

      const result = await service.deleteUser(user.id);

      expect(result).toBe(true);
      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: user.id },
      });
    });

    it('should return false if user does not exist', async () => {
      mockPrismaService.user.findUnique.mockReturnValue(null);
      const result = await service.deleteUser(99);

      expect(result).toBe(false);
      expect(mockPrismaService.user.delete).not.toHaveBeenCalled();
    });
  });
});
