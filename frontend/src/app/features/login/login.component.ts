// src/app/features/login/login.component.ts
import { Component }      from '@angular/core';
import { CommonModule }   from '@angular/common';
import { FormsModule }    from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService }    from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  submit() {
    this.error = '';
    this.auth.login(this.email, this.password)
      .subscribe({
        next: () => {
          // login bem-sucedido: vai para o board
          this.router.navigate(['/board']);
        },
        error: (err) => {
          // se a API responder erro 401 ou falhar, cai aqui
          console.error('login falhou', err);
          this.error = 'Credenciais inválidas';
        }
      });
  }
}
