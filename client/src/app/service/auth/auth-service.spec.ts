import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth-service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should send login request with correct credentials', () => {
      const email = 'test@example.com';
      const password = 'password123';
      const mockResponse = {
        data: {
          login: {
            access_token: 'mock-token-123',
            user: {
              id: 1,
              name: 'Test User',
              email: email,
              createdAt: '2023-01-01'
            }
          }
        }
      };

      service.login(email, password).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(response.data.login.access_token).toBe('mock-token-123');
        expect(response.data.login.user.email).toBe(email);
      });

      const req = httpMock.expectOne('http://localhost:3000/graphql');
      expect(req.request.method).toBe('POST');
      expect(req.request.body.variables.loginInput).toEqual({ email, password });
      req.flush(mockResponse);
    });

    it('should handle login error', () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';

      service.login(email, password).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(401);
        }
      });

      const req = httpMock.expectOne('http://localhost:3000/graphql');
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('register', () => {
    it('should send register request with user data', () => {
      const name = 'New User';
      const email = 'newuser@example.com';
      const password = 'password123';
      const mockResponse = {
        data: {
          createUser: {
            name,
            email,
            password
          }
        }
      };

      service.register(name, email, password).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(response.data.createUser.email).toBe(email);
        expect(response.data.createUser.name).toBe(name);
      });

      const req = httpMock.expectOne('http://localhost:3000/graphql');
      expect(req.request.method).toBe('POST');
      expect(req.request.body.variables.createUserInput).toEqual({ name, email, password });
      req.flush(mockResponse);
    });
  });
});

