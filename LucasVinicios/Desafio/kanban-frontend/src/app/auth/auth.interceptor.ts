// src/app/auth/auth.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service'; // <<--- CONFIRA O CAMINHO: '../auth.service' ou './auth.service' ?

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {
    console.log('--- DEBUG: AuthInterceptor INSTANCIADO! ---'); // <<--- ESTE LOG DEVE APARECER NO INÍCIO!
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const authToken = this.authService.getToken();

    console.log('--- DEBUG: INTERCEPTOR ATIVO --- URL:', request.url);
    console.log('--- DEBUG: INTERCEPTOR TOKEN ---', authToken);

    if (authToken) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}` // <<--- O ESPAÇO É CRÍTICO AQUI!
        }
      });
      console.log('--- DEBUG: INTERCEPTOR HEADER ADICIONADO ---', request.headers.get('Authorization'));
    } else {
      console.log('--- DEBUG: INTERCEPTOR SEM TOKEN ---');
    }

    return next.handle(request);
  }
}