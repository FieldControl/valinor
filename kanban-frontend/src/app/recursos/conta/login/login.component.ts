import { Component, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule } from '@angular/router';
import { ILogin, ILoginResponse } from '../../../compartilhado/modelos/usuario.modelo'; 
import { UsuarioService } from '../../../compartilhado/servicos/usuario.service';
import { AutenticarService } from '../../../compartilhado/servicos/autenticar.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatInputModule, ReactiveFormsModule, MatButtonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly usuarioService = inject(UsuarioService);
  private readonly autenticarService = inject(AutenticarService);
  private readonly router = inject(Router);
  fb = inject(NonNullableFormBuilder);
  loginForm = this.fb.group({
    email: this.fb.control('', [Validators.required, Validators.email]),
    senha: this.fb.control('', [
      Validators.required,
      Validators.minLength(8),
    ]),
  });

  login() {
    if (this.loginForm.invalid) {
      return;
    }

    this.usuarioService
      .login(this.loginForm.value as ILogin)
      .subscribe((token: ILoginResponse) => {
        this.autenticarService.token = token.acessToken;
        this.router.navigateByUrl('/quadros');
      });
  }
}
