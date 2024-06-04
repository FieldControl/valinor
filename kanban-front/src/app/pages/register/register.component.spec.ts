import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { UserService } from '../../shared/services/user.service';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { of, throwError } from 'rxjs';
import { IUser } from '../../core/models/user';

describe('RegisterComponent', () => {
  let registerComponent: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let userServiceMock: jasmine.SpyObj<UserService>

  beforeEach(async () => {
    userServiceMock = jasmine.createSpyObj('UserService', ['create'])

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, ReactiveFormsModule, RouterModule.forRoot([])],
      providers: [
        {
          provide: UserService, 
          useValue: userServiceMock
        },
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RegisterComponent);
    registerComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(registerComponent).toBeTruthy();
  });

  it('should display error message if form is invalid', () => {
    registerComponent.register();
    expect(registerComponent.registerFailed).toBeTrue();
  });

  it('should call UserService.create when form is valid', () => {
    const registerCredentials = { name: "Test User", email: 'email@exemplo.com', password: 'password' };
    registerComponent.registerForm.setValue(registerCredentials);

    const routerSpy = spyOn(TestBed.inject(Router), 'navigateByUrl');

    const mockResponse: IUser = {
      name: 'Test user',
      email: 'email@exemplo.com',
      password: 'password',
      cards: [],
      _id: 'idteste',
      creation: new Date()
    };

    userServiceMock.create.and.returnValue(of(mockResponse));

    registerComponent.register();

    expect(userServiceMock.create).toHaveBeenCalledWith(registerCredentials);
    expect(routerSpy).toHaveBeenCalledWith('/login');
  });

  it('should set registerFailed to true on register error', () => {
    const registerCredentials = { name: "Test User", email: 'email@exemplo.com', password: 'password' };
    registerComponent.registerForm.setValue(registerCredentials);
    userServiceMock.create.and.returnValue(throwError('error'));

    registerComponent.register();

    expect(registerComponent.registerFailed).toBeTrue();
  });
});
