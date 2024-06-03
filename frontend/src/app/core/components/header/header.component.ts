import { Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';



@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, MatButton],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
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
