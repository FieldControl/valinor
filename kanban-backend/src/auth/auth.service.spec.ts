import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthInput } from './dto/auth.input';
import { SignupInput } from './dto/auth.signup';
import { User } from '../user/user.entity';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;

  const mockUserService = {
    findUserByEmail: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockUser = {
    id: 1,
    name: 'John Doe',
    email: 'test@example.com',
    password: bcrypt.hashSync('password123', 10),
  } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should validate and return a user with a token', async () => {
      const authInput: AuthInput = {
        email: mockUser.email,
        password: 'password123',
      };
      mockUserService.findUserByEmail.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('mockToken');

      const result = await service.validateUser(authInput);

      expect(result.user).toEqual(mockUser);
      expect(result.token).toEqual('mockToken');
      expect(userService.findUserByEmail).toHaveBeenCalledWith(authInput.email);
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const authInput: AuthInput = {
        email: mockUser.email,
        password: 'wrongPassword',
      };
      mockUserService.findUserByEmail.mockResolvedValue(mockUser);

      await expect(service.validateUser(authInput)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('signup', () => {
    it('should create a user and return user with a token', async () => {
      const signupInput: SignupInput = {
        name: 'John Doe',
        email: 'test@example.com',
        password: 'password123',
      };
      const hashedPassword = bcrypt.hashSync(signupInput.password, 10);
      const newUser = { ...mockUser, password: hashedPassword };
      mockUserService.findUserByEmail.mockResolvedValue(null);
      mockUserService.createUser.mockResolvedValue(newUser);
      mockJwtService.signAsync.mockResolvedValue('mockToken');

      const result = await service.signup(signupInput);

      expect(result.user).toEqual(newUser);
      expect(result.token).toEqual('mockToken');
      expect(userService.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          name: signupInput.name,
          email: signupInput.email,
          password: expect.any(String),
        }),
      );
    });

    it('should throw ConflictException if email is already in use', async () => {
      const signupInput: SignupInput = {
        name: 'John Doe',
        email: 'test@example.com',
        password: 'password123',
      };
      mockUserService.findUserByEmail.mockResolvedValue(mockUser);

      await expect(service.signup(signupInput)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('logout', () => {
    it('should log out the user and return true', async () => {
      const userId = mockUser.id;
      mockUserService.updateUser.mockResolvedValue(true);

      const result = await service.logout(userId);

      expect(result).toBe(true);
      expect(userService.updateUser).toHaveBeenCalledWith(userId, {
        lastLoginAt: expect.any(Date),
      });
    });
  });
});
