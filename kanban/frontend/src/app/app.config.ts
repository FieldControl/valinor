import { ApplicationConfig, provideZoneChangeDetection, inject } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';

//Configuração principal da aplicação Angular
export const appConfig: ApplicationConfig = {
  providers: [
    //Habilita otimizações de detecção de mudanças com coalescência de eventos
    provideZoneChangeDetection({ eventCoalescing: true }),

    //Define as rotas da aplicação
    provideRouter(routes),

    //Habilita o uso do HttpClient para requisições HTTP
    provideHttpClient(),

    //Configura o Apollo Client para uso com GraphQL
    provideApollo(() => {
      const httpLink = inject(HttpLink);

      return {
        //Define a URI do endpoint GraphQL (substituído durante o build)
        link: httpLink.create({
          uri: '<%= endpoint %>',
        }),
        //Utiliza cache em memória para otimização
        cache: new InMemoryCache(),
      };
    })
  ]
};
