// ARQUIVO: src/app/app.config.ts

import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

// Importa a nossa configuração de rotas e o nosso interceptor de autenticação.
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';

/**
 * appConfig define a configuração principal da nossa aplicação Angular.
 * O array 'providers' é onde registamos os serviços e funcionalidades
 * que estarão disponíveis para toda a aplicação.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // 1. provideRouter(routes):
    //    Regista o serviço de roteamento do Angular e o configura com
    //    as rotas que definimos no nosso ficheiro './app.routes'.
    provideRouter(routes),

    // 2. provideHttpClient(withInterceptors([...])):
    //    Esta é a forma moderna de configurar o serviço HttpClient do Angular.
    //    - 'provideHttpClient' disponibiliza o serviço para fazer requisições HTTP.
    //    - 'withInterceptors([authInterceptor])' diz ao HttpClient para usar o nosso
    //      'authInterceptor' para CADA requisição que ele fizer. É aqui que a
    //      "magia" de anexar o token automaticamente é ativada.
    provideHttpClient(withInterceptors([authInterceptor])),
  ]
};