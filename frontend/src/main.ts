import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { inject } from '@angular/core';

import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';

import { App } from './app/app';

bootstrapApplication(App, {
  providers: [
    provideHttpClient(),
    provideApollo(() => {
      const httpLink = inject(HttpLink);
      return {
        link: httpLink.create({ uri: 'http://localhost:3000/graphql' }),
        cache: new InMemoryCache(),
      };
    }),
  ],
}).catch(console.error);
