import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


//importe para utilização dos protocolos http
import { provideHttpClient, withFetch } from '@angular/common/http';

import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';



import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AccessComponent } from './components/formAcessComponets/access/access.component';
import { LoginComponent } from './components/formAcessComponets/login/login.component';
import { RegisterComponent } from './components/formAcessComponets/register/register.component';
import { HomeComponent } from './components/homeCompenents/home/home.component';
import { HeaderComponent } from './components/homeCompenents/header/header.component';
import { NavbarComponent } from './components/homeCompenents/navbar/navbar.component';

@NgModule({
  declarations: [
    AppComponent,
    AccessComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    HeaderComponent,
    NavbarComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [provideAnimationsAsync(),
    provideHttpClient(withFetch())],//importando modulo, protocolo http.],
  bootstrap: [AppComponent]
})
export class AppModule { }
