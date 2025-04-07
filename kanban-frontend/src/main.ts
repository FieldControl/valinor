import { enableProdMode, NgZone } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { AppComponent } from './app/app.component';
import { Apollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';
import { HttpClientModule } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { importProvidersFrom } from '@angular/core';
import { environment } from './environments/environment';

import { addIcons } from 'ionicons';
import {
  close,
  closeOutline,
  trash,
  trashOutline
} from 'ionicons/icons';

addIcons({
  'close': close,
  'close-outline': closeOutline,
  'trash': trash,
  'trash-outline': trashOutline
});

enableProdMode();

bootstrapApplication(AppComponent, {
  providers: [
    provideIonicAngular(),
    provideRouter(routes),
    importProvidersFrom(HttpClientModule),
    {
      provide: Apollo,
      useFactory: (httpLink: HttpLink, ngZone: NgZone) => {
        const apollo = new Apollo(ngZone);
        apollo.create({
          link: httpLink.create({ uri: environment.graphqlUri }),
          cache: new InMemoryCache()
        });
        return apollo;
      },
      deps: [HttpLink, NgZone]
    }
  ]
});
