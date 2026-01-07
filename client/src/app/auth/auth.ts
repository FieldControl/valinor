import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth/auth-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './auth.html',
  styleUrl: './auth.scss',
})
export class Auth {
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {}

  loginForm!: FormGroup;
  isRegisterMode = false;

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.loginForm = this.fb.group({
      name: [''],
      email: [''],
      password: [''],
    });
  }

  toggleMode() {
    this.isRegisterMode = !this.isRegisterMode;
    this.loginForm.reset();
  }

  login(){
    const email = this.loginForm.get('email')?.value;
    const password = this.loginForm.get('password')?.value;
    this.authService.login(email, password).subscribe(response => {
      const accessToken = response.data.login.access_token;
      const user = response.data.login.user;
      localStorage.setItem('access_token', accessToken);
      console.log('User logged in:', user);
      this.router.navigate(['/board']);
    },
    error => {
      console.error('Login failed:', error);
    });
  }

  register(){
    const name = this.loginForm.get('name')?.value;
    const email = this.loginForm.get('email')?.value;
    const password = this.loginForm.get('password')?.value;
    this.authService.register(name, email, password).subscribe((response: any) => {
      console.log('User registered:', response);
      this.toggleMode();
    },
      (error: any) => {
      console.error('Registration failed:', error);
    });
  }
}
