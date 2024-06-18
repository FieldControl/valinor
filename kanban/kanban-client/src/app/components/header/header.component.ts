import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Observable } from 'rxjs';
import { AuthService } from '../../services/user/auth.service';
import { IUser } from '../../interfaces/user.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  user$: Observable<IUser | null> | undefined;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    this.user$ = this.authService.currentUser$;
  }

  isDashboardPage(): boolean {
    return this.router.url !== '/' && this.router.url !== '/register';
  }

  onLogout() {
    this.authService.logout();
    return this.router.navigate(['/']);
  }
}
