import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AutenticarService } from '../servicos/autenticar.service';

export const authGuard: CanActivateFn = (route, state) => {
  const autenticarService = inject(AutenticarService);
  return autenticarService.hasValidToken();
};
