import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../shared/services/user.service';
import { IRegister } from '../../core/models/user';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private userService = inject(UserService)
  private formBuilder = inject(FormBuilder)
  private router = inject(Router);

  registerForm = this.formBuilder.group({
    name: this.formBuilder.control('', Validators.required),
    email: this.formBuilder.control('', [Validators.required, Validators.email]),
    password: this.formBuilder.control('', Validators.required)
  })

  registerFailed = false
  existingUser = false

  register() {
    if (this.registerForm.invalid) {
      this.registerFailed = true;
      return;
    }
  
      this.userService.create(this.registerForm.value as IRegister).subscribe({
        next: (response) => {
          console.log('Sucesso', response);
          this.router.navigateByUrl('/login');
        },
        error: (err) => {
          console.log('Erro', err);
          this.registerFailed = true;
          if (err.error.message.includes('Já existe um usuário com este e-mail')) {
            this.existingUser = true;
          }
        }
      });
    }
  }