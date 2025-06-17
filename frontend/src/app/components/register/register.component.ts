// src/app/components/register/register.component.ts
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  username = '';
  email = '';
  password = '';
  role = 'MEMBER';
  error = '';
  success = '';

  constructor(private router: Router) {}

  async register() {
    this.error = '';
    try {
      const res = await fetch('http://jairomatheus89.site/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: this.username,
          email: this.email,
          password: this.password,
          role: this.role,
        }),
      });

      if (!res.ok) {
        this.error = 'Erro ao registrar: ' + res.statusText;
        return;
      }

      this.success = 'Conta criada com sucesso!';
      window.alert('conta criada com sucesso!')
      this.router.navigate(['/auth/login']);
    } catch {
      this.error = 'Erro de conexão';
    }
  }
}
