import { NgModule } from '@angular/core';
import { APOLLO_OPTIONS } from 'apollo-angular';
import { ApolloClientOptions, InMemoryCache } from '@apollo/client/core';
import { HttpLink } from 'apollo-angular/http';

/*
 Esta função cria a configuração do Apollo Client,
 apontando para o endpoint GraphQL do backend NestJS.
*/
export function createApollo(httpLink: HttpLink): ApolloClientOptions<any> {
  return {
    //Cria o link HTTP apontando para o backend local
    link: httpLink.create({
      uri: 'http://localhost:3000/graphql', //Endpoint do Backend
    }),

    //Cache em memória para otimizar performance e atualizações reativas
    cache: new InMemoryCache(),
  };
}

/*
 Módulo responsável por fornecer a configuração do Apollo Client
 para toda a aplicação Angular.
*/
@NgModule({
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [HttpLink], //Injeta o serviço que cria o link HTTP
    },
  ],
})
export class GraphQLModule {}
