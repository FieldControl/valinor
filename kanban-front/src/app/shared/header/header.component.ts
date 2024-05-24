import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TokenService } from '../services/token.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  private router = inject(Router);
  private tokenService = inject(TokenService)
  user: any

  ngOnInit(): void {
    this.user = this.tokenService.decodeToken()
  }

  logout() {
    localStorage.removeItem('acess_token')

    this.router.navigate(['/'])
  }
}
