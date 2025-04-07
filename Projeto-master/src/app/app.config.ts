import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), // Configuração das rotas
    provideClientHydration(), // Hidratação do cliente
    provideHttpClient(), // Adiciona o HttpClient como provedor global
  ],
};
