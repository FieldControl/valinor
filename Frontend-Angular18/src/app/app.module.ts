
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

//importe para utilização dos protocolos http
import { provideHttpClient, withFetch } from '@angular/common/http';

import { AccessAppComponent } from './components/formsComponents/accessApp/access-app.component';
import { FormLoginComponent } from './components/formsComponents/form-login/form-login.component';
import { FormRegisterComponent } from './components/formsComponents/form-register/form-register.component';




@NgModule({
  declarations: [
    AppComponent,
    AccessAppComponent,
    FormLoginComponent,
    FormRegisterComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
  ],
  providers: [
    provideAnimationsAsync(),
    provideHttpClient(withFetch())//importando modulo, protocolo http.
  ],
  bootstrap: [AppComponent]
})


export class AppModule { }
