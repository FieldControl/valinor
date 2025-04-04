import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache, ApolloClientOptions } from '@apollo/client/core';
import { inject } from '@angular/core';
import { AppComponent } from './app/app.component';

// 🔧 Função de configuração do Apollo (usada por provideApollo)
export function createApollo(): ApolloClientOptions<any> {
  const httpLink = inject(HttpLink);
  return {
    link: httpLink.create({ uri: 'http://localhost:3000/graphql' }),
    cache: new InMemoryCache(),
  };
}

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),           // Requisições HTTP padrão
    provideApollo(createApollo),  // Integração Apollo antiga (mas compatível com standalone)
  ],
}).catch((err) => console.error(err));
