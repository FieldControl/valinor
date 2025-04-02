import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import { AuthService } from "./services/auth.service"
import { ToastComponent } from "./components/toast/toast.component"
import { ToastService } from "./services/toast.service"
import { User } from "@angular/fire/auth"

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterModule, ToastComponent],
  template: `
    <div class="app-container">
      <header class="app-header">
        <div class="header-left">
          <h1>Angular Kanban Board</h1>
        </div>
        <div class="menu-toggle" (click)="toggleMenu()">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div class="header-right" [class.active]="isMenuOpen">
          <div class="close-menu" (click)="toggleMenu()">✕</div>
          <ng-container *ngIf="!(isLoggedIn$ | async); else loggedIn">
            <a routerLink="/login" class="nav-link" (click)="toggleMenu()">Login</a>
            <a routerLink="/register" class="nav-link" (click)="toggleMenu()">Cadastro</a>
          </ng-container>
          <ng-template #loggedIn>
            <a routerLink="/board" class="nav-link" (click)="toggleMenu()">Quadros</a>
            <span class="user-email">{{ getUserEmail() }}</span>
            <button (click)="logout()" class="logout-button">Sair</button>
          </ng-template>
        </div>
      </header>
      <main>
        <router-outlet></router-outlet>
      </main>
      <app-toast></app-toast>
    </div>
  `,
  styles: [
    `
    .app-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background-color: #F5F6F8;
    }
    
    .app-header {
      padding: 16px;
      background-color: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      z-index: 10;
    }
    
    .header-left h1 {
      margin: 0;
      font-family: 'Inter', sans-serif;
      font-weight: bold;
      font-size: 20px;
      color: #333;
    }
    
    .header-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    
    .menu-toggle {
      display: none;
      flex-direction: column;
      justify-content: space-between;
      width: 24px;
      height: 18px;
      cursor: pointer;
    }
    
    .menu-toggle span {
      display: block;
      height: 2px;
      width: 100%;
      background-color: #333;
      transition: all 0.3s ease;
    }
    
    .close-menu {
      display: none;
      font-size: 22px;
      position: absolute;
      top: 12px;
      right: 16px;
      cursor: pointer;
      color: #333;
    }
    
    .nav-link {
      color: #4a6ae5;
      text-decoration: none;
      font-weight: 500;
    }
    
    .nav-link:hover {
      text-decoration: underline;
    }
    
    .user-email {
      font-size: 14px;
      color: #666;
      margin-left: 8px;
    }
    
    .logout-button {
      background-color: transparent;
      border: 1px solid #4a6ae5;
      color: #4a6ae5;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    
    .logout-button:hover {
      background-color: #f0f4ff;
    }
    
    main {
      flex: 1;
      overflow: auto;
    }
    
    /* Media queries para responsividade */
    @media (max-width: 768px) {
      .header-right {
        position: fixed;
        top: 0;
        right: -250px;
        width: 250px;
        height: 100vh;
        background-color: white;
        flex-direction: column;
        align-items: flex-start;
        padding: 60px 20px 20px;
        transition: right 0.3s ease;
        box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
        z-index: 15;
      }
      
      .header-right.active {
        right: 0;
      }
      
      .menu-toggle {
        display: flex;
        z-index: 20;
      }
      
      .close-menu {
        display: block;
      }
      
      .nav-link {
        padding: 10px 0;
        width: 100%;
        border-bottom: 1px solid #eee;
      }
      
      .user-email {
        margin: 10px 0;
        padding: 10px 0;
        border-bottom: 1px solid #eee;
        width: 100%;
      }
      
      .logout-button {
        margin-top: 10px;
        width: 100%;
      }
    }
    
    @media (max-width: 480px) {
      .header-left h1 {
        font-size: 16px;
      }
      
      .app-header {
        padding: 12px;
      }
    }
  `,
  ],
})
export class AppComponent implements OnInit {
  title = "angular-kanban"
  isLoggedIn$: any;
  user$: any;
  currentUser: User | null = null;
  isMenuOpen = false;

  constructor(
    private authService: AuthService,
    private toastService: ToastService
  ) {
    this.isLoggedIn$ = this.authService.isLoggedIn;
    this.user$ = this.authService.currentUser$;
    
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnInit(): void {}

  getUserEmail(): string {
    return this.currentUser?.email || '';
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout(): void {
    this.isMenuOpen = false;
    this.authService.logout().subscribe({
      next: () => {
        this.toastService.show('Logout realizado com sucesso!', 'success');
      },
      error: (error) => {
        console.error('Erro ao fazer logout:', error);
        this.toastService.show('Erro ao fazer logout.', 'error');
      }
    });
  }
}

