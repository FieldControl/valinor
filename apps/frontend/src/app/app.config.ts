// Angular Core
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
// Angular Router
import { provideRouter } from '@angular/router';
// Angular Platform Browser
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
// Routes
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(withEventReplay()),
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
  ],
};
