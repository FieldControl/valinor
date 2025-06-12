import { bootstrapApplication }       from '@angular/platform-browser';
import { importProvidersFrom }        from '@angular/core';
import { BrowserModule }              from '@angular/platform-browser';
import { AppComponent }               from './app/app.component';
import { AppRoutingModule }           from './app/app-routing.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor }             from './app/core/auth/jwt.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      BrowserModule,
      AppRoutingModule,
      HttpClientModule
    ),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    }
  ],
}).catch(err => console.error(err));
