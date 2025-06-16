// src/app/login/login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { NotificationService } from '../notificacao'; // Verifique o caminho real

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent{
  email='';
  password='';
  errorMessage: string | null = null;
  showPassword = false;
  currentYear: number = new Date().getFullYear();

  constructor(private authService: AuthService,private router: Router,
    private notificationService: NotificationService
  ) { }

  onLogin(): void {
    this.errorMessage = null;
    this.authService.signIn({email: this.email, password: this.password}).subscribe({
      next: (response) => {
        this.notificationService.success("Login bem-sucedido!");
        this.router.navigate(['/boards']);
      },
      error: (error) => {
        this.notificationService.error("Erro ao realizar login!", error);
        this.errorMessage = error.error?.message || 'Credenciais invalidas';
      }
    });
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}