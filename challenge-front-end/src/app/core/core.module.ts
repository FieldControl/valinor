import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from 'app/app-routing.module';
import { CustomHttpInterceptor } from 'app/interceptors/custom-http.interceptor';
import { coreComponents } from 'core/components';
import { coreServices } from 'core/services';
import { CoreComponent } from 'core/core.component';
import { corePages } from 'core/pages';
import { AuthService } from 'guards/auth/services';
import { AuthModule } from 'guards/auth/auth.module';
import { SharedModule } from 'shared/shared.module';
import { coreDirectives } from 'core/directives';
import { corePipes } from 'core/pipes';
import { LAZY_WIDGETS, lazyArrayToObj } from 'app/lazy-widgets';

// export function getConfigAsync(configService: ConfigService) {
//   return () => configService.getConfigAsync();
// }

@NgModule({
  declarations: [
    ...coreComponents,
    ...coreDirectives,
    ...corePages,
    ...corePipes,
    CoreComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    SharedModule,
    AuthModule,
  ],
  exports: [
    AppRoutingModule,
    CoreComponent
  ],
  providers: [
    AuthService,
    ...coreServices,
    { provide: HTTP_INTERCEPTORS, useClass: CustomHttpInterceptor, multi: true },
    { provide: LAZY_WIDGETS, useFactory: lazyArrayToObj },
     // { provide: APP_INITIALIZER, useFactory: getConfigAsync, deps: [ConfigService], multi: true },

  ]
})
export class CoreModule {
}
