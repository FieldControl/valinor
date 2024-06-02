import { Component, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { ILogin, ILoginReponse } from '../../Models/user-model';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatInputModule, ReactiveFormsModule, MatButtonModule, RouterModule, MatIconModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly userService = inject(UserService); // Injeta o serviço UserService
  private readonly authService = inject(AuthService); // Injeta o serviço AuthService
  private readonly router = inject(Router); // Injeta o serviço Router
  fb = inject(NonNullableFormBuilder); // Injeta o FormBuilder
  loginForm = this.fb.group({
    email: this.fb.control('', [Validators.required, Validators.email]), // Define o controle de email no formulário com validadores de email e obrigatório
    password: this.fb.control('', [
      Validators.required,
      Validators.minLength(8), // Define o controle de senha no formulário com validadores de comprimento mínimo e obrigatório
    ]),
  });
  hide = true; // Define uma variável para alternar a visibilidade da senha

  // Função para lidar com o evento de login
  login() {
    if (this.loginForm.invalid) return; // Retorna se o formulário é inválido

    // Chama o método de login do UserService e subscreve para receber o token de resposta
    this.userService
      .login(this.loginForm.value as ILogin)
      .subscribe((token: ILoginReponse) => {
        // Define o token de acesso retornado pelo serviço de autenticação
        this.authService.token = token.accessToken;
        // Navega para a rota '/boards' após o login bem-sucedido
        this.router.navigateByUrl('/boards');
      });
  }

  // Função para lidar com o evento de clique para alternar a visibilidade da senha
  clickEvent(event: MouseEvent) {
    this.hide = !this.hide; // Inverte o estado de visibilidade da senha
    event.stopPropagation(); // Impede a propagação do evento de clique
  }
}
