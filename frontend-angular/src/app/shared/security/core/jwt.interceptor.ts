import { HttpInterceptorFn } from '@angular/common/http';
import { AuthenticateService } from '../../services/users/authenticate.service';
import { inject } from '@angular/core';


export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authenticateService = inject(AuthenticateService);
  
   if (authenticateService.token) {
    
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authenticateService.token}`
       }
    });

    return next(clonedRequest);
     
   }
   
  return next(req);
};
