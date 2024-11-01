import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../services/user/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.scss',
})
export class LoginFormComponent {
  constructor(private router: Router, private authService: AuthService) {}

  registerForm = new FormGroup({
    email: new FormControl(null, [Validators.required, Validators.email]),
    password: new FormControl(null, [
      Validators.required,
      Validators.minLength(3),
    ]),
  });

  get errors() {
    return {
      email: this.registerForm.get('email')?.errors,
      password: this.registerForm.get('password')?.errors,
    };
  }

  errorMessage: string = '';
  private extractErrorMessage(error: any) {
    if (error) {
      const parts = error.message.split(':');
      if (parts.length > 1) {
        return parts[1].trim();
      }
      if (parts == 'User not found') {
        return 'User does not exist!';
      }
      return parts;
    }
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const { email, password } = this.registerForm.value;

      if (email && password) {
        this.authService.login(email, password).subscribe({
          next: (result) => {
            this.router.navigate(['/dashboard']);
          },
          error: (error) => {
            this.errorMessage = this.extractErrorMessage(error);
          },
        });
      } else {
        console.error('Email or password is null or undefined.');
      }
    } else {
      console.log('Form Errors', this.errors);
    }
    this.registerForm.reset();
  }
}
