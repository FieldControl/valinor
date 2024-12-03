import { NgModule } from "@angular/core";
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from "@apollo/client/cache";

@NgModule({
  imports: [ ApolloModule ],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: (httpLink: HttpLink) => ({
        cache: new InMemoryCache(),
        link: httpLink.create({ uri: 'http://localhost:3000/graphql' }),
      }),
      deps: [ HttpLink ],
    },
  ],
})
export class GraphQLModule{}
