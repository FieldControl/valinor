import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h2>Login</h2>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              formControlName="email" 
              [ngClass]="{'is-invalid': submitted && f['email'].errors}"
            />
            <div *ngIf="submitted && f['email'].errors" class="invalid-feedback">
              <div *ngIf="f['email'].errors['required']">Email é obrigatório</div>
              <div *ngIf="f['email'].errors['email']">Digite um email válido</div>
            </div>
          </div>
          
          <div class="form-group">
            <label for="password">Senha</label>
            <input 
              type="password" 
              id="password" 
              formControlName="password" 
              [ngClass]="{'is-invalid': submitted && f['password'].errors}"
            />
            <div *ngIf="submitted && f['password'].errors" class="invalid-feedback">
              <div *ngIf="f['password'].errors['required']">Senha é obrigatória</div>
              <div *ngIf="f['password'].errors['minlength']">Senha deve ter pelo menos 6 caracteres</div>
            </div>
          </div>
          
          <div class="form-buttons">
            <button type="submit" [disabled]="loading" class="primary-button">
              <span *ngIf="loading" class="spinner"></span>
              Entrar
            </button>
          </div>
        </form>
        
        <div class="auth-footer">
          <p>Não tem uma conta? <a routerLink="/register">Cadastre-se</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-color: #f5f6f8;
    }
    
    .auth-card {
      width: 400px;
      padding: 2rem;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    h2 {
      margin-bottom: 1.5rem;
      color: #333;
      text-align: center;
    }
    
    .form-group {
      margin-bottom: 1rem;
    }
    
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
    
    input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }
    
    input.is-invalid {
      border-color: #dc3545;
    }
    
    .invalid-feedback {
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }
    
    .form-buttons {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-top: 1.5rem;
    }
    
    button {
      width: 100%;
      padding: 0.75rem;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .primary-button {
      background-color: #4a6ae5;
      color: white;
    }
    
    .primary-button:hover {
      background-color: #3f5ac8;
    }
    
    .auth-footer {
      margin-top: 1.5rem;
      text-align: center;
      font-size: 0.875rem;
    }
    
    .auth-footer a {
      color: #4a6ae5;
      text-decoration: none;
    }
    
    .spinner {
      display: inline-block;
      width: 1rem;
      height: 1rem;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 1s ease-in-out infinite;
      margin-right: 0.5rem;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get f() { return this.loginForm.controls; }

  onSubmit() {
    this.submitted = true;

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    const { email, password } = this.loginForm.value;

    this.authService.login(email, password)
      .subscribe({
        next: () => {
          this.router.navigate(['/board']);
          this.toastService.show('Login realizado com sucesso!', 'success');
        },
        error: (error) => {
          console.error('Erro no login:', error);
          this.loading = false;
          
          let errorMessage = 'Erro ao fazer login. Verifique suas credenciais.';
          
          // Verificar tipos específicos de erros para exibir mensagens mais amigáveis
          if (error && error.code) {
            switch(error.code) {
              case 'auth/invalid-credential':
                errorMessage = 'E-mail ou senha incorretos. Verifique suas credenciais.';
                // Tentar novamente após limpar os dados locais
                this.retryLoginAfterCleanup(email, password);
                break;
              case 'auth/user-not-found':
                errorMessage = 'Usuário não encontrado. Verifique seu e-mail.';
                break;
              case 'auth/wrong-password':
                errorMessage = 'Senha incorreta. Tente novamente.';
                break;
              case 'auth/user-disabled':
                errorMessage = 'Esta conta foi desativada.';
                break;
              case 'auth/too-many-requests':
                errorMessage = 'Muitas tentativas de login. Tente novamente mais tarde.';
                break;
              case 'auth/network-request-failed':
                errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
                break;
              default:
                errorMessage = `Erro: ${error.message || 'Problema desconhecido durante o login'}`;
            }
          }
          
          this.toastService.show(errorMessage, 'error');
        },
        complete: () => {
          this.loading = false;
        }
      });
  }

  // Tenta fazer login novamente após limpar os dados da sessão
  private retryLoginAfterCleanup(email: string, password: string): void {
    // Aguardar um breve momento para garantir que a limpeza seja concluída
    setTimeout(() => {
      this.loading = true;
      this.toastService.show('Tentando reconectar...', 'info');
      
      this.authService.login(email, password)
        .subscribe({
          next: () => {
            this.router.navigate(['/board']);
            this.toastService.show('Login realizado com sucesso!', 'success');
          },
          error: (retryError) => {
            console.error('Erro na segunda tentativa de login:', retryError);
            this.loading = false;
            this.toastService.show('Não foi possível fazer login. Por favor, tente novamente mais tarde.', 'error');
          },
          complete: () => {
            this.loading = false;
          }
        });
    }, 1000);
  }
} 