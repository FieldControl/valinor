import { HttpInterceptorFn } from '@angular/common/http';
import { Injector } from '@angular/core';
import { AuthenticateService } from '../../services/user/authenticate.service';


export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
   // Usando o Injector para obter a instância do AuthenticateService
   const injector = Injector.create({
    providers: [{ provide: AuthenticateService, useClass: AuthenticateService }]
  });
  const authService = injector.get(AuthenticateService);

  if(authService.token){
    req.headers.set('Authorization', `Bearer ${authService.token}` );
  }

  return next(req);
};