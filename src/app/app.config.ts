import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { register } from 'swiper/element/bundle';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(), provideRouter(routes), provideAnimations()],
};

register();

