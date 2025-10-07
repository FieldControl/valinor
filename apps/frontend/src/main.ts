// Angular Platform Browser
import { bootstrapApplication } from '@angular/platform-browser';
// App Configuration
import { appConfig } from './app/app.config';
// App Component
import { App } from './app/app';

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
