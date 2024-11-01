import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule } from '@angular/router';
import { ILogin, ILoginRespose } from '../../../shared/models/user.model';
import { UserService } from '../../../shared/services/user.service';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatInputModule, ReactiveFormsModule, MatButtonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly userService = inject(UserService)
  private readonly authService = inject(AuthService)
  private readonly router = inject(Router)
  fb = inject(NonNullableFormBuilder);
  loginForm = this.fb.group({
    email: this.fb.control('', [Validators.required, Validators.email]),
    senha: this.fb.control('', [
      Validators.required,
      Validators.minLength(8)
    ]),
  });

  // realizar login
  login() {
    if (this.loginForm.invalid) {
      return;
    }
    this.userService.login(this.loginForm.value as ILogin)
      .subscribe((token: ILoginRespose) => {
        this.authService.token = token.accessToken;
        this.router.navigateByUrl('/boards');
      });
  }

}
