import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent {
  sidebarExpanded = false;

  constructor(private router: Router) { }

  toggleSidebar() {
    this.sidebarExpanded = !this.sidebarExpanded;
  }

  goToBoard() {
    this.router.navigate(['/board']);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  changeTheme() {
    // Implemente a lógica para alterar o tema aqui
  }

  logout() {
    // Limpe qualquer informação de autenticação aqui
    // Por exemplo, se você estiver usando o serviço de autenticação do Angular:
    // this.authService.logout();

    // Redirecione o usuário para a tela de login
    this.router.navigate(['/']);
  }
}