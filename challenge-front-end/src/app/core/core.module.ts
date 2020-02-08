import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from 'app/app-routing.module';
import { CustomHttpInterceptor } from 'app/interceptors/custom-http.interceptor';
import { coreComponents } from 'core/components';
import { CoreComponent } from 'core/core.component';
import { SharedModule } from 'shared/shared.module';
import { coreDirectives } from 'core/directives';
import { corePipes } from 'core/pipes';
import { LAZY_WIDGETS } from 'app/lazy-widgets';
import { HomeComponent } from './pages/home/home.component';
import { lazyArrayToObj } from 'app/lazy-array-to-obj';
import { DynamicComponentCreatorService } from './services/dynamic-component-creator/dynamic-component-creator.service';
import { CoreHttpService } from './services/core-http/core-http.service';
import { corePages } from './pages';
import { LoadingService } from './services/loading/loading.service';

// export function getConfigAsync(configService: ConfigService) {
//   return () => configService.getConfigAsync();
// }

@NgModule({
  declarations: [
    ...corePages,
    ...coreComponents,
    ...coreDirectives,
    ...corePipes,
    CoreComponent
  ],
  imports: [
    SharedModule,
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
  ],
  exports: [
    AppRoutingModule,
    CoreComponent,
    HomeComponent
  ],
  providers: [
    DynamicComponentCreatorService,
    CoreHttpService,
    LoadingService,
    { provide: HTTP_INTERCEPTORS, useClass: CustomHttpInterceptor, multi: true },
    { provide: LAZY_WIDGETS, useFactory: lazyArrayToObj },
     // { provide: APP_INITIALIZER, useFactory: getConfigAsync, deps: [ConfigService], multi: true },

  ]
})
export class CoreModule {
}
