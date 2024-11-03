import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    login: jest.fn(dto => {
      return {
        access_token: 'mockedJwtToken',
      };
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return an access token if credentials are valid', async () => {
      const loginDto: LoginDto = { username: 'test', password: 'password' };
      const result = await controller.login(loginDto);

      expect(result).toEqual({ access_token: 'mockedJwtToken' });
      expect(service.login).toHaveBeenCalledWith(loginDto);
    });

    it('should throw UnauthorizedException if credentials are invalid', async () => {
      const loginDto: LoginDto = { username: 'invalid', password: 'invalid' };
      jest.spyOn(service, 'login').mockImplementation(() => {
        throw new UnauthorizedException();
      });

      await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(service.login).toHaveBeenCalledWith(loginDto);
    });
  });
});