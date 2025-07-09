import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';


import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

import { environment } from './environments/environment';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(),
  ],
}).catch((err: any) => console.error(err)); 