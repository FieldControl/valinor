import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h2>Cadastro</h2>
        
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="name">Nome</label>
            <input 
              type="text" 
              id="name" 
              formControlName="name" 
              [ngClass]="{'is-invalid': submitted && f['name'].errors}"
            />
            <div *ngIf="submitted && f['name'].errors" class="invalid-feedback">
              <div *ngIf="f['name'].errors['required']">Nome é obrigatório</div>
            </div>
          </div>
          
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
          
          <div class="form-group">
            <label for="confirmPassword">Confirmar Senha</label>
            <input 
              type="password" 
              id="confirmPassword" 
              formControlName="confirmPassword" 
              [ngClass]="{'is-invalid': submitted && f['confirmPassword'].errors}"
            />
            <div *ngIf="submitted && f['confirmPassword'].errors" class="invalid-feedback">
              <div *ngIf="f['confirmPassword'].errors['required']">Confirmação de senha é obrigatória</div>
              <div *ngIf="f['confirmPassword'].errors['mustMatch']">As senhas devem coincidir</div>
            </div>
          </div>
          
          <div class="form-buttons">
            <button type="submit" [disabled]="loading" class="primary-button">
              <span *ngIf="loading" class="spinner"></span>
              Cadastrar
            </button>
          </div>
        </form>
        
        <div class="auth-footer">
          <p>Já tem uma conta? <a routerLink="/login">Faça login</a></p>
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
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {
    this.registerForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validator: this.mustMatch('password', 'confirmPassword')
    });
  }

  get f() { return this.registerForm.controls; }

  mustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];

      if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
        return;
      }

      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }
    };
  }

  onSubmit() {
    this.submitted = true;

    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    const { email, password } = this.registerForm.value;

    this.authService.register(email, password)
      .subscribe({
        next: () => {
          this.router.navigate(['/login']);
          this.toastService.show('Cadastro realizado com sucesso! Faça login para continuar.', 'success');
        },
        error: (error) => {
          console.error('Erro no registro:', error);
          this.loading = false;
          let errorMessage = 'Erro ao criar conta. Por favor tente novamente.';
          
          // Verificar tipos específicos de erros para exibir mensagens mais amigáveis
          if (error && error.code) {
            switch(error.code) {
              case 'auth/email-already-in-use':
                errorMessage = 'Este e-mail já está sendo usado por outra conta.';
                break;
              case 'auth/invalid-email':
                errorMessage = 'O e-mail fornecido é inválido.';
                break;
              case 'auth/weak-password':
                errorMessage = 'A senha é muito fraca. Use pelo menos 6 caracteres.';
                break;
              case 'auth/network-request-failed':
                errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
                break;
              case 'auth/invalid-credential':
                errorMessage = 'Credenciais inválidas ou expiradas. Tente novamente.';
                break;
              default:
                errorMessage = `Erro ao criar conta: ${error.message}`;
            }
          }
          
          this.toastService.show(errorMessage, 'error');
        },
        complete: () => {
          this.loading = false;
        }
      });
  }
} 