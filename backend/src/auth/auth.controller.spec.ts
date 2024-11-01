import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { BadRequestException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
  });

  describe('create', () => {
    it('should throw BadRequestException if email is not provided', async () => {
      const registerDto: RegisterDto = {
        email: '',
        password: '12345',
        firstName: 'John',
        lastName: 'Doe',
      };

      await expect(authController.create(registerDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should create a user and return login response', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: '12345',
        firstName: 'John',
        lastName: 'Doe',
      };
      const user = { email: 'test@example.com' };
      const loginResponse = { accessToken: 'some_token' };

      userService.create = jest.fn().mockResolvedValue(user);
      authService.login = jest.fn().mockResolvedValue(loginResponse);

      const result = await authController.create(registerDto);

      expect(userService.create).toHaveBeenCalledWith(registerDto);
      expect(authService.login).toHaveBeenCalledWith({
        email: user.email.toLowerCase(),
        password: registerDto.password,
      });
      expect(result).toEqual(loginResponse);
    });

    it('should throw BadRequestException if user creation fails', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: '12345',
        firstName: 'John',
        lastName: 'Doe',
      };

      userService.create = jest.fn().mockResolvedValue(null);

      await expect(authController.create(registerDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('login', () => {
    it('should return login response', () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: '12345',
      };
      const loginResponse = { accessToken: 'some_token' };

      authService.login = jest.fn().mockReturnValue(loginResponse);

      const result = authController.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(loginResponse);
    });
  });
});
