import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../../shared/services/auth.service';
import { inject } from '@angular/core';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  // adicionar cabeçalho de autorização com token jwt, se disponível
  if (authService.token()) {

    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authService.token()}`
      }
    });
    return next(cloned);
  }

  return next(req);
};
