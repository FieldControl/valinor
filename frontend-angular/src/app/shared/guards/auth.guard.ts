import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthenticateService } from '../../services/authenticate.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthenticateService)
  return authService.hasvalidTokten();
};
