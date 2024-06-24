import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { AuthService } from '../services/user/auth.service';

@Injectable({
  providedIn: 'root',
})
export class RouterGuard {
  constructor(private router: Router, private authService: AuthService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): any {
    const isAuthenticated = this.authService.isAuthenticated();

    if (!isAuthenticated && state.url !== '/') {
      return this.router.createUrlTree(['/']);
    } else if (isAuthenticated && state.url === '/') {
      return this.router.createUrlTree(['/dashboard']);
    }
    return true;
  }
}
