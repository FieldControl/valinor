import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../shared/services/user.service';
import { ILogin } from '../../core/models/user';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private userService = inject(UserService)
  private formBuilder = inject(FormBuilder)
  private router = inject(Router);


  loginForm = this.formBuilder.group({
    email: this.formBuilder.control('', [Validators.required, Validators.email]),
    password: this.formBuilder.control('', Validators.required)
  })

  loginFailed = false

  login() {
    if (this.loginForm.invalid) {
      this.loginFailed = true;
      return;
    }
      this.userService.login(this.loginForm.value as ILogin).subscribe({
        next: (response) => {
          console.log('Sucesso', response);
          this.router.navigateByUrl('/boards');
        },
        error: (err) => {
          console.log('Erro', err);
          this.loginFailed = true;
        }
      });
  }


}
