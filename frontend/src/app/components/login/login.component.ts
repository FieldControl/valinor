import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';

  constructor(private router: Router) {}

  async login() {
    
    this.error = '';
    try {
      const res = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: this.username, password: this.password }),
      });

      if (!res.ok) {
        this.error = 'Login failed: ' + res.statusText;
        return;
      }

      const data = await res.json();
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('role', data.role);

      if (data.role === 'LEADER') {
        this.router.navigate(['/dashboard/leader']);
      } else {
        this.router.navigate(['/dashboard/member']);
      }
    } catch {
      this.error = 'Erro de conexão';
    }
  }

  goToRegister() {
    this.router.navigate(['/users/register']);
  }
}
