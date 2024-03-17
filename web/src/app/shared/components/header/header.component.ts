import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  constructor(private cookieService: CookieService, private router: Router) {}

  logout(): void {
    this.cookieService.delete('token');
    this.router.navigate(['/']);
  }
}
