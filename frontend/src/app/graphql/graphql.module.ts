import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { APOLLO_OPTIONS } from 'apollo-angular';
import { ApolloClient, InMemoryCache } from '@apollo/client/core';

import { AppComponent } from '../app.component';

export function createApollo() {
  return new ApolloClient({
    uri: 'http://localhost:3000/graphql', 
    cache: new InMemoryCache(),
  });
}

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, HttpClientModule],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
