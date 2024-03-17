import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { UserService } from '../../service/user/user.service';
import { MessageErrorComponent } from '../../shared/components/message-error/message-error.component';
import { SignUpComponent } from './sign-up.component';

describe('SignUpComponent', () => {
  let component: SignUpComponent;
  let fixture: ComponentFixture<SignUpComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const userService = jasmine.createSpyObj('UserService', ['create']);
    const router = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [SignUpComponent, MessageErrorComponent],
      imports: [ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: UserService, useValue: userService },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SignUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should possible to register a user and be redirected', () => {
    const userRequest = {
      name: 'John Doe',
      email: 'johndoe@email.com',
      password: '123',
    };

    const userResponse = {
      id: '1',
      name: 'John Doe',
      email: 'johndoe@email.com',
    };

    userServiceSpy.create.and.returnValue(of(userResponse));

    component.createUserForm.setValue(userRequest);
    component.onSubmitcreateUserForm();

    expect(component.isError).toBeFalse();
    expect(component.isLoading).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should return error if the email already exists', fakeAsync(() => {
    const userRequest = {
      name: 'John Doe',
      email: 'johndoe@email.com',
      password: '123',
    };

    const errorMessage = 'Email already exists';

    userServiceSpy.create.and.throwError(errorMessage);

    expect(() => {
      component.createUserForm.setValue(userRequest);
      component.onSubmitcreateUserForm();
      tick();
    }).toThrowError(errorMessage);
  }));
});
