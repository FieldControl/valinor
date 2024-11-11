import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule
  ],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <mat-card-header>
          <mat-card-title>{{ isLogin ? 'Login' : 'Registro' }}</mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <form #authForm="ngForm" (ngSubmit)="onSubmit()">
            <mat-form-field *ngIf="!isLogin" appearance="fill" class="full-width">
              <mat-label>Nome</mat-label>
              <input matInput [(ngModel)]="name" name="name" required>
            </mat-form-field>

            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" [(ngModel)]="email" name="email" required>
            </mat-form-field>

            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Senha</mat-label>
              <input matInput type="password" [(ngModel)]="password" name="password" required>
            </mat-form-field>

            <div class="error-message" *ngIf="error">{{ error }}</div>

            <button mat-raised-button color="primary" type="submit" class="full-width">
              {{ isLogin ? 'Entrar' : 'Registrar' }}
            </button>
          </form>
        </mat-card-content>

        <mat-card-actions>
          <button mat-button (click)="toggleMode()">
            {{ isLogin ? 'Não tem uma conta? Registre-se' : 'Já tem uma conta? Faça login' }}
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-container {
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #f5f5f5;
    }
    .auth-card {
      width: 100%;
      max-width: 400px;
      margin: 20px;
    }
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    .error-message {
      color: red;
      margin-bottom: 16px;
    }
  `]
})
export class LoginComponent {
  isLogin = true;
  email = '';
  password = '';
  name = '';
  error = '';

  constructor(private authService: AuthService) {}

  onSubmit() {
    this.error = '';
    
    if (this.isLogin) {
      if (this.authService.login(this.email, this.password)) {
        this.resetForm();
      } else {
        this.error = 'Email ou senha inválidos';
      }
    } else {
      if (this.authService.register(this.email, this.password, this.name)) {
        this.isLogin = true;
        this.resetForm();
      } else {
        this.error = 'Email já cadastrado';
      }
    }
  }

  toggleMode() {
    this.isLogin = !this.isLogin;
    this.resetForm();
  }

  private resetForm() {
    this.email = '';
    this.password = '';
    this.name = '';
    this.error = '';
  }
}