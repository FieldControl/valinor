import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { UserService } from '../../shared/services/user.service';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let loginComponent: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let userServiceMock: jasmine.SpyObj<UserService>

  beforeEach(async () => {
    userServiceMock = jasmine.createSpyObj('UserService', ['login'])
    
    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule, RouterModule.forRoot([])],
      providers: [
        {
          provide: UserService, 
          useValue: userServiceMock
        },
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LoginComponent);
    loginComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(loginComponent).toBeTruthy();
  });

  it('should initialize the login form', () => {
    expect(loginComponent.loginForm).toBeDefined();
    expect(loginComponent.loginForm.controls.email).toBeDefined();
    expect(loginComponent.loginForm.controls.password).toBeDefined();
  });

  it('should display error message if form is invalid', () => {
    loginComponent.login();
    expect(loginComponent.loginFailed).toBeTrue();
  });

  it('should call UserService.login when form is valid', () => {
    const loginCredentials = { email: 'email@exemplo.com', password: 'password' };
    loginComponent.loginForm.setValue(loginCredentials);
    userServiceMock.login.and.returnValue(of({ token: '123' }));

    const routerSpy = spyOn(TestBed.inject(Router), 'navigateByUrl');

    loginComponent.login();

    expect(userServiceMock.login).toHaveBeenCalledWith(loginCredentials);
    expect(routerSpy).toHaveBeenCalledWith('/boards');
  });

  it('should set loginFailed to true on login error', () => {
    const loginCredentials = { email: 'email@exemplo.com', password: 'password' };
    loginComponent.loginForm.setValue(loginCredentials);
    userServiceMock.login.and.returnValue(throwError('error'));

    loginComponent.login();

    expect(loginComponent.loginFailed).toBeTrue();
  });
});
