import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';

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

  login() {
    if (this.loginForm.invalid) {
      return
    }

    const formData = this.loginForm.value
    const email = formData.email || ''
    const password = formData.password || ''

    if (email && password){
      this.userService.login({email, password}).subscribe({next: (response) => {
        console.log('Sucesso', response)
        this.router.navigateByUrl('/boards')
      }})
    }
  }

}
