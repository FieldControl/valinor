import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';
import { CommonModule } from '@angular/common'; // Importe o CommonModule

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule], // Adicione CommonModule aqui
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'], // Corrija de styleUrl para styleUrls
})
export class HeaderComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  get isLoggedIn() {
    return this.authService.token;
  }

  signOut() {
    this.authService.token = '';
    this.router.navigateByUrl('/login');
  }
}
