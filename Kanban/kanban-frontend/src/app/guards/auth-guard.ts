import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    // Se o utilizador estiver logado, permite o acesso.
    return true;
  } else {
    
    
    return router.createUrlTree(['/login']);
  }
};