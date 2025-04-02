import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, switchMap, of, catchError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  // Se a requisição já possui um Authorization header, deixa passar sem modificação
  if (req.headers.has('Authorization')) {
    return next(req);
  }

  // Primeiro tentar obter o token de forma síncrona para evitar um observable desnecessário
  const token = authService.getToken();
  
  if (token) {
    // Se temos um token imediatamente disponível, use-o
    console.log('Adicionando token à requisição de forma síncrona');
    const clonedReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(clonedReq);
  }
  
  // Caso contrário, obter de forma assíncrona (pode envolver uma atualização de token)
  return authService.getTokenAsync().pipe(
    switchMap(asyncToken => {
      if (asyncToken) {
        console.log('Adicionando token à requisição de forma assíncrona');
        const clonedReq = req.clone({
          headers: req.headers.set('Authorization', `Bearer ${asyncToken}`)
        });
        return next(clonedReq);
      }
      
      // Se ainda não temos token, enviar a requisição sem autorização
      console.log('Requisição enviada sem token de autorização');
      return next(req);
    }),
    catchError(error => {
      console.error('Erro ao obter token para requisição:', error);
      // Em caso de erro na obtenção do token, continuar sem ele
      return next(req);
    })
  );
}; 