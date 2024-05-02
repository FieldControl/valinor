import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  error: string = '';

  constructor(private router: Router, private authService: AuthService) { }

  // Método para registrar com a API
  /*
  register() {
    this.authService.register(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/board']),
      error: err => this.error = 'Erro no registro'
    });
  }
  */

  // Método temporário para passar sem registrar com a API
  register() {
    this.router.navigate(['/board']);
  }

  goToLogin() {
    this.router.navigate(['/']);
  }
}