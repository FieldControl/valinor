// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { HTTP_INTERCEPTORS, provideHttpClient } from '@angular/common/http'; // <<-- Importe provideHttpClient e HTTP_INTERCEPTORS
import { AuthInterceptor } from './auth/auth.interceptor'; // <<-- Importe o AuthInterceptor

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(), // <<-- ESTA LINHA É CRÍTICA PARA FORNECER HTTPCLIENT
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
};