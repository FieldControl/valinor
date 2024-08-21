import { Component, inject } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { UsuarioService } from '../../../compartilhado/servicos/usuario.service'; 
import { ILoginResponse, IRegistro } from '../../../compartilhado/modelos/usuario.modelo';
import { AutenticarService } from '../../../compartilhado/servicos/autenticar.service'; 

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [MatInputModule, ReactiveFormsModule, MatButtonModule, RouterModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.scss',
})
export class RegistrarComponent {
  private readonly usuarioService = inject(UsuarioService);
  private readonly autenticarService = inject(AutenticarService);
  private readonly router = inject(Router);
  fb = inject(NonNullableFormBuilder);
  registroForm = this.fb.group({
    email: this.fb.control('', [Validators.required, Validators.email]),
    senha: this.fb.control('', [
      Validators.required,
      Validators.minLength(8),
    ]),
    primeiroNome: this.fb.control('', [Validators.required]),
    sobrenome: this.fb.control('', [Validators.required]),
  });

  registro() {
    if (this.registroForm.invalid) {
      return;
    }

    this.usuarioService
      .registro(this.registroForm.value as IRegistro)
      .subscribe((token: ILoginResponse) => {
        this.autenticarService.token = token.acessToken;
        this.router.navigateByUrl('/quadros');
      });
  }
}
