// Angular Core
import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
// Angular SSR
import { provideServerRendering, withRoutes } from '@angular/ssr';
// App Configuration
import { appConfig } from './app.config';
// Server Routes
import { serverRoutes } from './app.routes.server';

const serverConfig: ApplicationConfig = {
  providers: [provideServerRendering(withRoutes(serverRoutes))],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
