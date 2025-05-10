import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';
import { AppComponent } from './app/app.component';
import { inject } from '@angular/core';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withFetch()),
    provideApollo(() => {
      const httpLink = inject(HttpLink);
      return {
        cache: new InMemoryCache(),
        link: httpLink.create({ uri: 'http://localhost:3000/graphql' }),
      };
    }),
  ],
});
