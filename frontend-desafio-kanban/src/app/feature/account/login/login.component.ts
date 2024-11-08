import { Component, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule } from '@angular/router';
import { ILogin, ILoginResponse } from '../../../shared/models/user.model';
import { AuthService } from '../../../shared/services/auth.service';
import { UserService } from '../../../shared/services/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatInputModule, ReactiveFormsModule, MatButtonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  fb = inject(NonNullableFormBuilder);
  loginForm = this.fb.group({
    emailUser: this.fb.control('', [Validators.required, Validators.email]),
    passwordUser: this.fb.control('', [
      Validators.required,
      Validators.minLength(8),
    ]),
  });

  login() {
    if (this.loginForm.invalid) {
      return;
    }

    this.userService
     .login(this.loginForm.value as ILogin)
     .subscribe((token: ILoginResponse) => {
       this.authService.token = token.accessToken;
       this.router.navigateByUrl('/boards');
     });
  }

}
