import { Component, inject } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../../shared/services/user.service';
import { ILoginResponse, IRegister } from '../../../shared/models/user.model';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [MatInputModule, ReactiveFormsModule, MatButtonModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  fb = inject(NonNullableFormBuilder);
  registerForm = this.fb.group({
    emailUser: this.fb.control('', [Validators.required, Validators.email]),
    passwordUser: this.fb.control('', [
      Validators.required,
      Validators.minLength(8),
    ]),
    firstName: this.fb.control('', [Validators.required]),
    lastName: this.fb.control('', [Validators.required]),
  });

    register() {
      if(this.registerForm.invalid) {
        return;
      }

      this.userService
       .register(this.registerForm.value as IRegister)
       .subscribe((token: ILoginResponse) => {
         this.authService.token = token.accessToken;
         this.router.navigateByUrl('/boards');
       });
    }
}
