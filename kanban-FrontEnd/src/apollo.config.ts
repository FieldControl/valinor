import { HttpLink } from 'apollo-angular/http';
import { inject } from '@angular/core';
import { ApolloClient, InMemoryCache } from '@apollo/client/core';

//Cliente Apollo reutilizável
export const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: inject(HttpLink).create({
    uri: 'http://localhost:3000/graphql',
  }),
});
