import { Component, OnInit, inject } from '@angular/core';
import { IUser } from '../../../Models/user-model';
import { UserService } from '../../../services/user.service';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule], // Importa o módulo RouterModule
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  public user: IUser | undefined; // Declara uma variável para armazenar os dados do usuário
  private userService: UserService = inject(UserService); // Injeta o serviço UserService
  private readonly authService = inject(AuthService); // Injeta o serviço AuthService
  private readonly router = inject(Router); // Injeta o serviço Router

  constructor() {
    // Obtém os dados do usuário ao inicializar o componente
    this.userService.getUserData().subscribe(user => {
      this.user = user; // Atribui os dados do usuário à variável local
    });
  }

  // Verifica se o usuário está autenticado
  get isLoggedIn() {
    return this.authService.token; // Retorna true se o token de autenticação estiver presente
  }

  // Função para efetuar logout
  signOut() {
    this.authService.token = ''; // Limpa o token de autenticação
    this.router.navigateByUrl('/login'); // Redireciona para a página de login
  }
}
