import { TestBed } from '@angular/core/testing';
import {
  ApolloTestingController,
  ApolloTestingModule,
} from 'apollo-angular/testing';
import { CookieService } from 'ngx-cookie-service';
import { AuthRequest } from 'src/app/models/interface/user/auth/request/AuthRequest';
import { AuthResponse } from 'src/app/models/interface/user/auth/response/AuthResponse';
import { refreshTokenResponse } from 'src/app/models/interface/user/auth/response/refreshToken';
import { createUserRequest } from 'src/app/models/interface/user/signUp/request/createUserRequest';
import { createUserResponse } from 'src/app/models/interface/user/signUp/response/createUserResponse';
import { UserResponse } from 'src/app/models/interface/user/user/response/UserResponse';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let cookieServiceStub: Partial<CookieService>;
  let controller: ApolloTestingController;

  beforeEach(() => {
    cookieServiceStub = {
      get: () => 'mockToken',
    };

    TestBed.configureTestingModule({
      imports: [ApolloTestingModule],
      providers: [
        UserService,
        { provide: CookieService, useValue: cookieServiceStub },
      ],
    });
    service = TestBed.inject(UserService);
    controller = TestBed.inject(ApolloTestingController);
  });

  afterEach(() => {
    controller.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Get all users', () => {
    it('should return all users', () => {
      const mockUsers: Array<UserResponse> = [
        { id: '1', name: 'John doe' },
        { id: '2', name: 'John doe2' },
      ];

      service.getAllUsers().subscribe((users) => {
        expect(users).toEqual(mockUsers);
      });

      const op = controller.expectOne('GetAllUsers');

      op.flush({
        data: {
          users: mockUsers,
        },
      });
    });
  });

  describe('Create User', () => {
    it('should possible to create a user', () => {
      const userRequest: createUserRequest = {
        name: 'John doe',
        email: 'johndoe@email.com',
        password: '123',
      };

      const userResponse: createUserResponse = {
        id: '1',
        name: 'John doe',
        email: 'johndoe@email.com',
      };

      service.create(userRequest).subscribe((users) => {
        expect(users).toEqual(userResponse);
        expect(users.id).toEqual(userResponse.id);
        expect(users.email).toEqual(userResponse.email);
        expect(users.name).toEqual(userResponse.name);
      });

      const op = controller.expectOne('CreateUser');

      op.flush({
        data: {
          users: userResponse,
        },
      });
    });
  });

  describe('Auth User', () => {
    it('should be possible to log in with a user', () => {
      const login: AuthRequest = {
        email: 'johndoe@email.com',
        password: '123',
      };

      const userResponse: AuthResponse = {
        id: '1',
        name: 'John doe',
        email: 'johndoe@email.com',
        token: 'user-token',
      };

      service.auth(login).subscribe((users) => {
        expect(users).toEqual(userResponse);
        expect(users.id).toEqual(userResponse.id);
        expect(users.email).toEqual(userResponse.email);
        expect(users.name).toEqual(userResponse.name);
        expect(users.token).toEqual(userResponse.token);
      });

      const op = controller.expectOne('Login');

      op.flush({
        data: {
          users: userResponse,
        },
      });
    });
  });

  describe('Token verify', () => {
    it('should return true if user is logged in', () => {
      const result = service.isLoggedIn();
      expect(result).toBe(true);
    });

    it('should return false if user is not logged in', () => {
      cookieServiceStub.get = () => '';
      const result = service.isLoggedIn();
      expect(result).toBe(false);
    });

    it('should possible to revalidate the token', () => {
      const mockReturnToken: refreshTokenResponse = {
        token: 'new-token',
      };

      service.refreshToken().subscribe((token) => {
        expect(token).toEqual(mockReturnToken);
      });

      const op = controller.expectOne('revalidateToken');

      op.flush({
        data: {
          token: mockReturnToken,
        },
      });
    });
  });
});
