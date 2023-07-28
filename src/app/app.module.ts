import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { JwtModule } from '@auth0/angular-jwt';
import { CORE_SERVICES, INTERCEPTORS } from '@core/constants';
import { environment } from '@env/environment.development';
import { ModulesModule } from '@module/modules.module';
import { NgxsActionsExecutingModule } from '@ngxs-labs/actions-executing';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { NgxsModule } from '@ngxs/store';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    ModulesModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    CoreModule,
    SharedModule,
    JwtModule.forRoot({
      config: {
        allowedDomains: ['*'],
      },
    }),
    NgxsModule.forRoot([], {
      developmentMode: !environment.production,
    }),
    NgxsReduxDevtoolsPluginModule.forRoot(),
    NgxsActionsExecutingModule.forRoot(),
  ],
  providers: [...INTERCEPTORS, ...CORE_SERVICES],
  bootstrap: [AppComponent],
})
export class AppModule {}
