import { LoginPageComponent } from './login/login.page.component';
import { NavigationModule } from './navigation/navigation/navigation.module';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { CoreModule } from '../shared/coreShared/core.module';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { MarvelService } from './menu/services/menu.page.marvel.service';
import { HttpClientModule } from '@angular/common/http';


@NgModule({
  declarations: [AppComponent],
  imports: [
    // Imports do Angular
    BrowserModule,
    FormsModule,
    NavigationModule,
    HttpClientModule,


    // Imports do Ionic
    IonicModule.forRoot(),

    // Imports internos do aplicativo
    CoreModule,
    AppRoutingModule
  ],
  providers: [
    LoginPageComponent,


    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
