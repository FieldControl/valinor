import { FormControl, FormGroup } from '@angular/forms';
import { AuthLoginComponent } from './../../app/AuthModule/Components/auth-login/auth-login.component';
import { of } from 'rxjs';

describe('AuthLoginComponent', () => {
  let component: AuthLoginComponent;

  beforeEach(() => {
    component = new AuthLoginComponent();

    component.authService = {
      login: () => of([{ username: 'field', password: 'control' }])
    } as any;

    component.tokenGeneratorService = {
      generateRandomKey: () => 'mocked_token'
    } as any;
  });

  it('should return success message after login', () => {
    const usernameControl: FormControl = new FormControl('field');
    const passwordControl: FormControl = new FormControl('control');

    component.formCreate = new FormGroup({
      username: usernameControl,
      password: passwordControl
    });

    component.login();

    expect(component.tokenSpect).toBe('mocked_token');
  });

  it('should handle invalid credentials during login', () => {
    const usernameControl: FormControl = new FormControl('user');
    const passwordControl: FormControl = new FormControl('pass');

    component.authService!.login = () => of([]);

    component.formCreate = new FormGroup({
      username: usernameControl,
      password: passwordControl
    });

    component.login();

    expect(component.tokenSpect).toBe('');
  });
});

