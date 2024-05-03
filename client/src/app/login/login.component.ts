import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  error: string = '';

  constructor(private router: Router, private authService: AuthService) { }

  // Método de login que autentica com a API
  login() {
    this.authService.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/board']),
      error: err => this.error = 'Erro na autenticação do login'
    });
  }

  // Método temporário que passa qualquer login para o Board
  /*
  login() {
    if (this.email && this.password) {
      this.router.navigate(['/board']);
    } else {
      this.error = 'Por favor, informe o e-mail e senha';
    }
  }
  */

  register() {
    this.router.navigate(['/register']);
  }
}