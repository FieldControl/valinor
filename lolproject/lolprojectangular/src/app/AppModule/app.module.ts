import { FormBuilder } from '@angular/forms';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './Routing/app-routing.module';
import { AppComponent } from './Components/app/app.component';
import { SharedModule } from 'src/shared/shared.module';
import { FormGroup } from '@angular/forms';
import { NavigationModule } from '../NavigationModule/navigation.module';
import { HttpClientModule } from '@angular/common/http';
import { AuthGuard } from 'src/shared/Utils/auth-guard/auth-guard.service';
import { AuthLoginComponent } from '../AuthModule/Components/auth-login/auth-login.component';
import { NavigationComponent } from '../NavigationModule/Components/navigation/navigation.component';


@NgModule({
  declarations: [
    AppComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SharedModule,
    NavigationModule,
    HttpClientModule


  ],
  providers: [AuthLoginComponent, AuthGuard, NavigationComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
