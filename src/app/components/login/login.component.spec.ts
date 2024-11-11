import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatCardModule,
        LoginComponent
      ],
      providers: [AuthService]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle between login and register modes', () => {
    expect(component.isLogin).toBeTruthy();
    component.toggleMode();
    expect(component.isLogin).toBeFalsy();
    component.toggleMode();
    expect(component.isLogin).toBeTruthy();
  });

  it('should show error message for invalid login', () => {
    component.email = 'test@test.com';
    component.password = 'wrongpassword';
    component.onSubmit();
    expect(component.error).toBe('Email ou senha inválidos');
  });

  it('should show error message for duplicate email during registration', () => {
    authService.register('test@test.com', 'password123', 'Test User');
    
    component.isLogin = false;
    component.email = 'test@test.com';
    component.password = 'password123';
    component.name = 'Another User';
    component.onSubmit();
    
    expect(component.error).toBe('Email já cadastrado');
  });

  it('should reset form after successful registration', () => {
    component.isLogin = false;
    component.email = 'test@test.com';
    component.password = 'password123';
    component.name = 'Test User';
    component.onSubmit();
    
    expect(component.email).toBe('');
    expect(component.password).toBe('');
    expect(component.name).toBe('');
    expect(component.error).toBe('');
    expect(component.isLogin).toBeTruthy();
  });
});