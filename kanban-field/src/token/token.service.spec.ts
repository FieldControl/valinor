import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users/users.service';
import { TokenService } from './token.service';
import { AuthService } from '../auth/auth.service';
import { Model } from 'mongoose';
import { Token, TokenDocument } from './token.entity';
import { getModelToken } from '@nestjs/mongoose';

const responsible = 'responsible';

const hash = '12312312313123';

const existingToken = { _id: '1', hash: 'oldhash', responsible: responsible };

const newToken = { _id: '1', hash: hash, responsible: responsible };

const createdToken = { hash: hash, responsible: responsible }

describe('AuthService', () => {
  let tokenService: TokenService;
  let tokenModel: Model<TokenDocument>
  let authService: AuthService;
  let userService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        {
            provide: getModelToken(Token.name),
            useValue: {
                findOne: jest.fn().mockResolvedValue(null),
                findByIdAndUpdate: jest.fn().mockResolvedValue(newToken),
                create: jest.fn().mockResolvedValue(createdToken)
            }
        },
        {
            provide: UsersService, // Forneça um mock para o CardsService
            useValue: {
              findByMail: jest.fn()
            }
        },
        {
            provide: AuthService, // Forneça um mock para o CardsService
            useValue: {
              login: jest.fn()
            }
        },
      ],
    }).compile();

    tokenService = module.get<TokenService>(TokenService);
    tokenModel = module.get<Model<TokenDocument>>(getModelToken(Token.name))
    authService = module.get<AuthService>(AuthService);
    userService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('saveToken', () => {
    it('should save a token successfully if it does not exist', async () => {
      // Act
      const result = await tokenService.saveToken(hash, responsible);

      // Assert
      expect(result).toEqual({ hash: hash, responsible: responsible });
      expect(tokenModel.findOne).toHaveBeenCalledWith({ responsible: responsible });
      expect(tokenModel.create).toHaveBeenCalledWith({ hash: hash, responsible: responsible });
    });

    it('should update a token successfully if it exists', async () => {
      jest.spyOn(tokenModel, 'findOne').mockResolvedValueOnce(existingToken)

      // Act
      await tokenService.saveToken(hash, responsible);

      // Assert
      expect(tokenModel.findOne).toHaveBeenCalledWith({ responsible: responsible });
      expect(tokenModel.findByIdAndUpdate).toHaveBeenCalledWith(existingToken._id, { hash: hash }, { new: true });
    });

    it('should throw an error if saving the token fails', async () => {
      // Arrange
      const hash = 'hash';
      const responsible = 'responsible';

      jest.spyOn(tokenModel, 'findOne').mockRejectedValueOnce(new Error())

      // Assert
      await expect(tokenService.saveToken(hash, responsible)).rejects.toThrow(Error);
    });
  });
});
