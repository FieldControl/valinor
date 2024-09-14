import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


//importe para utilização dos protocolos http
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AppRoutingModule } from './app-routing.module';


import { AppComponent } from './app.component';
import { AccessComponent } from './components/formAcessComponets/access/access.component';
import { LoginComponent } from './components/formAcessComponets/login/login.component';
import { RegisterComponent } from './components/formAcessComponets/register/register.component';
import { ListComponent } from './components/boardsComponents/list/list.component';

import { MatDialogModule } from '@angular/material/dialog';
import { HeaderComponent } from "./components/homeCompenents/header/header.component";
import { jwtInterceptor } from './shared/security/core/jwt.interceptor';






@NgModule({
  declarations: [
    AppComponent,
    AccessComponent,
    LoginComponent,
    RegisterComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    ListComponent,
    MatDialogModule,
    HeaderComponent
],
  providers: [provideAnimationsAsync(),
    provideHttpClient(withFetch(), withInterceptors([jwtInterceptor])),],
  bootstrap: [AppComponent]
})

export class AppModule { }
