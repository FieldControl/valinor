import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  let token = localStorage.getItem('acess_token');
  const router = inject(Router)

  if (token) {
    let decodedToken = jwtDecode(token)
      const isExpired = decodedToken && decodedToken.exp
        ? decodedToken.exp < Date.now() / 1000
        : false

      if (isExpired) {
        console.log('Token expirado')
        router.navigate(['/'])
      } 

      const authReq = req.clone({
            setHeaders: { 
                Authorization: `Bearer ${token}`
            }
        });
        return next(authReq);
      }
    return next(req);
};
