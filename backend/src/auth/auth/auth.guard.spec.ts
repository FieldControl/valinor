import { AuthGuard } from './auth.guard'; // Adjust the path as necessary
import { JwtService } from '@nestjs/jwt';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let jwtService: JwtService;

  beforeEach(() => {
    // Create a mock instance of JwtService
    jwtService = {} as JwtService; // You can extend this mock as needed

    // Instantiate AuthGuard with the mocked JwtService
    authGuard = new AuthGuard(jwtService);
  });

  it('should be defined', () => {
    expect(authGuard).toBeDefined();
  });
});
