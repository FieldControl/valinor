import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
import { TokenService } from '../token/token.service';

const loginUser = { 
  ...new User({ 
    name: 'user 1', 
    cards: undefined,
    creation: undefined,
    email: 'email@exemplo.com', 
    password: 'senha' 
  }),
  _id: '664fa1f6d2e549d1d6buser1'
}

const testUserEntityList = [
  { 
    ...new User({ 
      name: 'user 1', 
      email: 'email@exemplo.com', 
      password: 'senha' 
    }),
    _id: '664fa1f6d2e549d1d6buser1'
  },
  { 
    ...new User({ 
      name: 'user 2', 
      email: 'email2@exemplo.com', 
      password: 'senha' 
    }),
    _id: '664fa1f6d2e549d1d6buser2'
  }
];

const token = 'token';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UsersService;
  let jwtService: JwtService;
  let tokenService: TokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService, // Forneça um mock para o CardsService
          useValue: {
            findByMail: jest.fn().mockImplementation((email) => {
              return testUserEntityList.find(user => user.email === email);
            }),
          }
        },
        {
          provide: JwtService, // Forneça um mock para o CardsService
          useValue: {
            sign: jest.fn().mockReturnValue(token)
          }
        },
        {
          provide: TokenService, // Forneça um mock para o CardsService
          useValue: {
            saveToken: jest.fn().mockResolvedValue(token)
          }
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    tokenService = module.get<TokenService>(TokenService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return a user if valid email and password are provided', async () => {
      const result = await authService.validateUser('email@exemplo.com', 'senha');

      expect(result).toEqual(loginUser);
      expect(userService.findByMail).toHaveBeenCalledWith('email@exemplo.com');
    });

    it('should return null if invalid email or password are provided', async () => {
      const result = await authService.validateUser('email@exemplo.com', 'senhaerrada');

      expect(result).toBeNull();
      expect(userService.findByMail).toHaveBeenCalledWith('email@exemplo.com');
    });
  });

  describe('login', () => {
    it('should return an access token for a valid user', async () => {
      const user = { _id: '1', email: 'test@example.com' };

      const result = await authService.login(user);

      expect(result).toEqual({ acess_token: token });
      expect(jwtService.sign).toHaveBeenCalledWith({ username: user.email, sub: user._id });
      expect(tokenService.saveToken).toHaveBeenCalledWith(token, user.email);
    });
  });
});
