// src/app/app.component.ts
import { Component }       from '@angular/core';
import { Router }          from '@angular/router';
import { RouterModule }    from '@angular/router';
import { CommonModule }    from '@angular/common';
import { AuthService }     from './core/auth/auth.service';

@Component({
  standalone: true,
  imports: [
    RouterModule,
    CommonModule    // ← necessário para *ngIf
  ],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(public auth: AuthService, private router: Router) {}

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
