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
import { HomeComponent } from './components/homeCompenents/home/home.component';
import { NavbarComponent } from './components/homeCompenents/navbar/navbar.component';
import { ListComponent } from './components/boardsComponents/list/list.component';
import { DetailsComponent } from './components/boardsComponents/details/details.component';
import { HelpComponent } from './components/informationComponents/help/help.component';
import { DeveloperComponent } from './components/informationComponents/developer/developer.component';
import { jwtInterceptor } from './core/interceptor/jwt.interceptor';






@NgModule({
  declarations: [
    AppComponent,
    AccessComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    NavbarComponent,
    DetailsComponent,
    DeveloperComponent,
    HelpComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    ListComponent
  ],
  providers: [provideAnimationsAsync(),
    provideHttpClient(withFetch(), withInterceptors([jwtInterceptor])),],
  bootstrap: [AppComponent]
})

export class AppModule { }
