import { Component, inject } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { ILoginReponse, IRegister } from '../../Models/user-model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [MatInputModule, ReactiveFormsModule, MatButtonModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})

export class RegisterComponent {
  
  private readonly authService = inject(AuthService); // Injeta o serviço AuthService
  private readonly router = inject(Router); // Injeta o serviço Router
  private readonly userService = inject(UserService); // Injeta o serviço UserService
  fb = inject(NonNullableFormBuilder); // Injeta o FormBuilder
  registerForm = this.fb.group({
    email: this.fb.control('', [Validators.required, Validators.email]), // Define o controle de email no formulário com validadores de email e obrigatório
    password: this.fb.control('', [
      Validators.required,
      Validators.minLength(8), // Define o controle de senha no formulário com validadores de comprimento mínimo e obrigatório
    ]),
    firstName: this.fb.control('', [Validators.required]), // Define o controle de firstName no formulário como obrigatório
    lastName: this.fb.control('', [Validators.required]), // Define o controle de lastName no formulário como obrigatório
  });

  // Função para lidar com o evento de registro
  register() {
    if (this.registerForm.invalid) { // Retorna se o formulário é inválido
      return;
    }

    // Chama o método de registro do UserService e subscreve para receber o token de resposta
    this.userService
      .register(this.registerForm.value as IRegister)
      .subscribe((token: ILoginReponse) => {
        // Define o token de acesso retornado pelo serviço de autenticação
        this.authService.token = token.accessToken;
        // Navega para a rota '/boards' após o registro bem-sucedido
        this.router.navigateByUrl('/boards');
      });
  }
}
