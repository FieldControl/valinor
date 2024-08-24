import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

//importe para utilização dos protocolos http
import { provideHttpClient, withFetch } from '@angular/common/http';

import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AccessComponent } from './components/formAcessComponets/access/access.component';
import { LoginComponent } from './components/formAcessComponets/login/login.component';
import { RegisterComponent } from './components/formAcessComponets/register/register.component';

@NgModule({
  declarations: [
    AppComponent,
    AccessComponent,
    LoginComponent,
    RegisterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
  ],
  providers: [provideAnimationsAsync(),
    provideHttpClient(withFetch())],//importando modulo, protocolo http.],
  bootstrap: [AppComponent]
})
export class AppModule { }
