import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Verifica se o usuário está logado
  get estaLogado() {
    return this.authService.token;
  }

  // Realiza o logout
  logout(){
    this.authService.token = "";
    this.router.navigateByUrl('/login');
  }
}
