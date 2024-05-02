import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Valinor | Kanban';
  primaryMessage = '';
  secondaryMessage = '';

  constructor(private router: Router, private authService: AuthService) { // Injete o AuthService
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/' || event.url === '/register') {
          this.primaryMessage = 'Seja bem-vindo ao Valinor!';
          this.secondaryMessage = 'O seu Kanban prático e eficiente.'
        } else {
          this.primaryMessage = 'VALINOR';
          this.secondaryMessage = 'Conectado como: ' + this.authService.user.name;
        }
      }
    });
  }

}
