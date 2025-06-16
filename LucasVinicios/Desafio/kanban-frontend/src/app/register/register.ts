import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule,
    FormsModule
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class RegisterComponent {
  email='';
  password='';
  passwordConfirm='';
  errorMessage: string | null = null;
  successMessage: string | null= null;
  showPassword = false;

  constructor(private authService: AuthService, private router: Router) { }

  onRegister(): void {
    this.errorMessage = null;
    this.successMessage = null;

    if (this.password !== this.passwordConfirm) {
      this.errorMessage = 'As senhas não coincidem';
      return;
    }

    this.authService.signUp({email: this.email, password: this.password}).subscribe({
      next: () => {
        console.log('Cadastro bem-sucedido!');
        this.successMessage = 'Usuário cadastrado com sucesso!'
      },
      error: (error) => {
        console.error('Erro no cadastro:', error);
        this.errorMessage = error.error?.message || "Erro ao cadastrar. Tente novamente!"
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}

