import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should register a new user successfully', () => {
    const result = service.register('test@test.com', 'password123', 'Test User');
    expect(result).toBeTruthy();
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    expect(users.length).toBe(1);
    expect(users[0].email).toBe('test@test.com');
    expect(users[0].name).toBe('Test User');
  });

  it('should not register a user with duplicate email', () => {
    service.register('test@test.com', 'password123', 'Test User');
    const result = service.register('test@test.com', 'password456', 'Another User');
    expect(result).toBeFalsy();
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    expect(users.length).toBe(1);
  });

  it('should login successfully with correct credentials', () => {
    service.register('test@test.com', 'password123', 'Test User');
    const result = service.login('test@test.com', 'password123');
    expect(result).toBeTruthy();
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    expect(currentUser).toBeTruthy();
    expect(currentUser.email).toBe('test@test.com');
  });

  it('should not login with incorrect credentials', () => {
    service.register('test@test.com', 'password123', 'Test User');
    const result = service.login('test@test.com', 'wrongpassword');
    expect(result).toBeFalsy();
    
    const currentUser = localStorage.getItem('currentUser');
    expect(currentUser).toBeNull();
  });

  it('should logout successfully', () => {
    service.register('test@test.com', 'password123', 'Test User');
    service.login('test@test.com', 'password123');
    
    service.logout();
    
    const currentUser = localStorage.getItem('currentUser');
    expect(currentUser).toBeNull();
  });
});