import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { of } from 'rxjs';
import { UserService } from '../../service/user/user.service';
import { MessageErrorComponent } from '../../shared/components/message-error/message-error.component';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let cookieServiceSpy: jasmine.SpyObj<CookieService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const userService = jasmine.createSpyObj('UserService', [
      'isLoggedIn',
      'auth',
    ]);
    const cookieService = jasmine.createSpyObj('CookieService', ['set']);
    const router = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [HomeComponent, MessageErrorComponent],
      imports: [ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: UserService, useValue: userService },
        { provide: CookieService, useValue: cookieService },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    cookieServiceSpy = TestBed.inject(
      CookieService
    ) as jasmine.SpyObj<CookieService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to kanban if user is logged in', () => {
    userServiceSpy.isLoggedIn.and.returnValue(true);
    component.ngOnInit();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/kanban']);
  });

  it('should not redirect if user is not logged in', () => {
    userServiceSpy.isLoggedIn.and.returnValue(false);
    component.ngOnInit();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should set token and navigate to kanban on successful login', () => {
    const authRequest = { email: 'johndoe@email.com', password: '123' };
    const authResponse = {
      id: '1',
      name: 'John Doe',
      email: 'johndoe@email.com',
      token: 'token',
    };
    userServiceSpy.auth.and.returnValue(of(authResponse));

    component.loginForm.setValue(authRequest);
    component.onSubmitLoginForm();

    expect(cookieServiceSpy.set).toHaveBeenCalledWith(
      'token',
      authResponse.token
    );
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/kanban']);
    expect(component.isError).toBeFalse();
    expect(component.isLoading).toBeFalse();
  });

  it('should return an error when the credential is invalid', () => {
    const authRequest = { email: 'johndoe@email.com', password: '123' };
    userServiceSpy.auth.and.throwError('Invalid credentials');

    expect(() => {
      component.loginForm.setValue(authRequest);
      component.onSubmitLoginForm();
    }).toThrowError();
  });
});
