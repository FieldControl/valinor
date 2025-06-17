import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';
import { routes } from './app.routes';
import { provideApollo } from 'apollo-angular';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { App } from './app';
import { bootstrapApplication } from '@angular/platform-browser';
import { Apollo } from 'apollo-angular';
import { Index } from './desafio-field/index';




export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes)
  ]
};

bootstrapApplication(App, {
  providers: [
    provideHttpClient(withFetch()),
    provideApollo(() => ({
      cache: new InMemoryCache(),
      uri: 'http://localhost:4000/graphql',
    })),
  ],
});

