import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

/**
 * LoginComponent
 * Este componente gere a página de autenticação, que inclui os formulários
 * de login e de registo de novos utilizadores.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  // Formulários reativos para login e registo
  loginForm: FormGroup;
  registerForm: FormGroup;

  // Controla qual formulário (login ou registo) está visível na tela
  isLoginView = true;

  // Propriedades para exibir mensagens de feedback ao utilizador
  errorMessage: string | null = null;
  successMessage: string | null = null;

  /**
   * O construtor injeta as dependências necessárias para o componente funcionar.
   * @param fb - FormBuilder: um serviço do Angular para criar formulários reativos.
   * @param authService - O nosso serviço customizado para lidar com as chamadas de API de autenticação.
   * @param router - O serviço de rotas do Angular, para redirecionar o utilizador após o login.
   */
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Inicializa o formulário de login com os seus campos e validações
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    // Inicializa o formulário de registo com os seus campos e validações
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  /**
   * Alterna a visualização entre o formulário de login e o de registo.
   * Limpa as mensagens de feedback sempre que a vista é trocada.
   */
  toggleView(): void {
    this.isLoginView = !this.isLoginView;
    this.errorMessage = null;
    this.successMessage = null;
  }

  /**
   * É executado quando o formulário de login é submetido.
   */
  onLogin(): void {
    if (this.loginForm.invalid) return;
    this.errorMessage = null;

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        console.log('Login bem-sucedido!', response);
        // Após o sucesso, redireciona o utilizador para a página principal do Kanban.
        this.router.navigate(['/kanban']);
      },
      error: (err) => {
        console.error('Erro no login:', err);
        this.errorMessage = 'Email ou senha inválidos. Por favor, tente novamente.';
      }
    });
  }

  /**
   * É executado quando o formulário de registo é submetido.
   */
  onRegister(): void {
    if (this.registerForm.invalid) return;
    this.errorMessage = null;

    this.authService.register(this.registerForm.value).subscribe({
      next: (response) => {
        console.log('Registo bem-sucedido!', response);
        this.successMessage = 'Registo realizado com sucesso! Faça o login para continuar.';
        this.toggleView(); // Leva o utilizador para a tela de login após o sucesso
      },
      error: (err) => {
        console.error('Erro no registo:', err);
        // Exibe a mensagem de erro específica vinda do backend (ex: "email já em uso")
        this.errorMessage = err.error.message || 'Não foi possível realizar o registo.';
      }
    });
  }
}