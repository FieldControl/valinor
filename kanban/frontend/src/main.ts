import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';

import { importProvidersFrom, inject } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';


bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(), //Habilita suporte a HTTP na aplicação

    importProvidersFrom(HttpClientModule), //Importa o módulo HttpClient como provider

    //
    provideApollo(() => { //Configura o cliente Apollo GraphQL
      const httpLink = inject(HttpLink); //Injeção do HttpLink
      return { //Retorna as configurações do cliente Apollo
        cache: new InMemoryCache(), //Utiliza cache em memória para otimizar performance e evitar chamadas duplicadas
        link: httpLink.create({ //Define o endpoint do servidor GraphQL
          uri: 'http://localhost:3000/graphql',
        }),
      };
    }),
  ],
});
