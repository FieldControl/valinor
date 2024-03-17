import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { UserService } from '../service/user/user.service';
import { AuthGuard } from './auth-guard.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let userService: jasmine.SpyObj<UserService>;
  let router: Router;

  beforeEach(() => {
    const userServiceSpy = jasmine.createSpyObj('UserService', ['isLoggedIn']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        AuthGuard,
        { provide: UserService, useValue: userServiceSpy },
      ],
    });

    guard = TestBed.inject(AuthGuard);
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    router = TestBed.inject(Router);
  });

  it('should allow navigation if user is logged in', () => {
    userService.isLoggedIn.and.returnValue(true);

    const result = guard.canActivate();

    expect(result).toBeTrue();
  });

  it('should redirect to home page and return false if user is not logged in', () => {
    userService.isLoggedIn.and.returnValue(false);

    spyOn(router, 'navigate');

    const result = guard.canActivate();

    expect(result).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });
});
