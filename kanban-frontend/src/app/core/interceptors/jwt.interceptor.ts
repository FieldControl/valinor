import { HttpInterceptorFn } from '@angular/common/http';
import { AutenticarService } from '../../compartilhado/servicos/autenticar.service';
import { inject } from '@angular/core';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const autenticarService = inject(AutenticarService);
  if (autenticarService.token()) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${autenticarService.token()}`,
      },
    });
    return next(cloned);
  }
  return next(req);
};
