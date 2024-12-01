import { Injectable } from '@angular/core';
import { ApolloClient, InMemoryCache } from '@apollo/client/core';

@Injectable({
  providedIn: 'root',
})
export class GraphqlService {
  private apolloClient: ApolloClient<any>;

  constructor() {
    this.apolloClient = new ApolloClient({
      uri: 'http://localhost:3030/graphql',
      cache: new InMemoryCache(),
    });
  }

  get client() {
    return this.apolloClient;
  }
}
