import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Auth } from './auth';
import { AuthService } from '../service/auth/auth-service';

describe('Auth', () => {
  let component: Auth;
  let fixture: ComponentFixture<Auth>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login', 'register']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [Auth, HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Auth);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with register mode false', () => {
    expect(component.isRegisterMode).toBe(false);
  });

  it('should create login form on init', () => {
    expect(component.loginForm).toBeDefined();
    expect(component.loginForm.get('email')).toBeDefined();
    expect(component.loginForm.get('password')).toBeDefined();
    expect(component.loginForm.get('name')).toBeDefined();
  });

  describe('toggleMode', () => {
    it('should toggle between login and register modes', () => {
      expect(component.isRegisterMode).toBe(false);
      component.toggleMode();
      expect(component.isRegisterMode).toBe(true);
      component.toggleMode();
      expect(component.isRegisterMode).toBe(false);
    });

    it('should reset form when toggling mode', () => {
      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'password123'
      });
      component.toggleMode();
      expect(component.loginForm.get('email')?.value).toBe(null);
      expect(component.loginForm.get('password')?.value).toBe(null);
    });
  });

  describe('login', () => {
    it('should call authService.login and navigate on success', () => {
      const mockResponse = {
        data: {
          login: {
            access_token: 'mock-token',
            user: {
              id: 1,
              name: 'Test User',
              email: 'test@example.com',
              createdAt: '2023-01-01'
            }
          }
        }
      };

      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'password123'
      });

      authService.login.and.returnValue(of(mockResponse));

      component.login();

      expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(localStorage.getItem('access_token')).toBe('mock-token');
      expect(router.navigate).toHaveBeenCalledWith(['/board']);
    });

    it('should handle login error', () => {
      spyOn(console, 'error');
      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'wrongpassword'
      });

      authService.login.and.returnValue(throwError(() => new Error('Invalid credentials')));

      component.login();

      expect(authService.login).toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('should call authService.register and toggle mode on success', () => {
      const mockResponse = {
        data: {
          createUser: {
            id: 1,
            name: 'New User',
            email: 'newuser@example.com',
            createdAt: '2023-01-01'
          }
        }
      };

      component.loginForm.patchValue({
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123'
      });

      authService.register.and.returnValue(of(mockResponse));
      spyOn(component, 'toggleMode');

      component.register();

      expect(authService.register).toHaveBeenCalledWith('New User', 'newuser@example.com', 'password123');
      expect(component.toggleMode).toHaveBeenCalled();
    });

    it('should handle register error', () => {
      spyOn(console, 'error');
      component.loginForm.patchValue({
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123'
      });

      authService.register.and.returnValue(throwError(() => new Error('Registration failed')));

      component.register();

      expect(authService.register).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });
  });
});

