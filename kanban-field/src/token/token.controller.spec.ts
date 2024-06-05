import { Test, TestingModule } from '@nestjs/testing';
import { TokenController } from './token.controller';
import { TokenService } from './token.service';

const newToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImpvbmF0aGFuQGdtYWlsLmNvbSIsInN1YiI6IjY2MWVjOGU1OWE2N2Y3NGQzZWU0ZDIxMSIsImlhdCI6MTcxNzAwMTc1OSwiZXhwIjoxNzE3MDIxNzU5fQ.c4JVuAmAKvJt7ijFBi6tPW0-B9LcsBAe_xxxxxxxxxx'

describe('TokenController', () => {
  let tokenController: TokenController;
  let tokenService: TokenService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [TokenController],
      providers: [
        {
            provide: TokenService,
            useValue: {
                refreshToken: jest.fn().mockResolvedValue(newToken),
            }
        }
      ],
    }).compile();

    tokenController = app.get<TokenController>(TokenController);
    tokenService = app.get<TokenService>(TokenService);
  });

  describe('refreshToken', () => {
    it('should refresh the token successfully', async () => {
      // Arrange
      const oldToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImpvbmF0aGFuQGdtYWlsLmNvbSIsInN1YiI6IjY2MWVjOGU1OWE2N2Y3NGQzZWU0ZDIxMSIsImlhdCI6MTcxNzAwMTc1OSwiZXhwIjoxNzE3MDIxNzU5fQ.c4JVuAmAKvJt7ijFBi6tPW0-B9LcsBAe_yyyyyyyyyy';

      // Act
      const result = await tokenController.refreshToken({ oldToken });

      // Assert
      expect(result).toEqual(newToken);
      expect(tokenService.refreshToken).toHaveBeenCalledWith(oldToken);
      expect(tokenService.refreshToken).toHaveBeenCalledTimes(1);
    });

    it('should throw an exception', () => {
        // Arrange
        const oldToken = 'oldToken';
        jest.spyOn(tokenService, 'refreshToken').mockRejectedValueOnce(new Error());
  
        // Assert
        expect(tokenController.refreshToken({ oldToken })).rejects.toThrow(Error);
      });
    });
  });  
