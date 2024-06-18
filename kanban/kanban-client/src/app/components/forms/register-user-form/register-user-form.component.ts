import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserService } from '../../../services/user/register-user.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register-user-form.component.html',
  styleUrls: ['./register-user-form.component.scss'],
})
export class RegisterUserFormComponent {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private toastr: ToastrService
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*\d)(?=.*[a-zA-Z])(?=.*\W)[\d\w\W]{8,22}$/),
        ],
      ],
    });
  }

  get errors() {
    return {
      name: this.registerForm.get('name')?.errors,
      email: this.registerForm.get('email')?.errors,
      password: this.registerForm.get('password')?.errors,
    };
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const { name, email, password } = this.registerForm.value;

      if (name && email && password) {
        this.userService.register(name, email, password).subscribe({
          next: (result) => {
            this.toastr.success('Registration successful!', 'Success');
            this.registerForm.reset();
          },
          error: (error) => {
            console.error('Unable to complete registration:', error);
            if (error.graphQLErrors) {
              const gqlError = error.graphQLErrors[0];
              if (gqlError.message === 'This email is already in use.') {
                this.toastr.error('This email is already in use.', 'Error');
              } else {
                this.toastr.error(
                  'Registration failed. Please try again.',
                  'Error'
                );
              }
            } else {
              this.toastr.error(
                'Registration failed. Please try again.',
                'Error'
              );
            }
          },
        });
      }
    } else {
      console.error('Invalid form. Check the fields.');
    }
  }
}
