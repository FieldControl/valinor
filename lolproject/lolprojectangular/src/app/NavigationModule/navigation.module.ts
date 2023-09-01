import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './Components/navbar/navbar.component';
import { SharedModule } from 'src/shared/shared.module';
import { NavigationComponent } from './Components/navigation/navigation.component';
import { BrowserModule } from '@angular/platform-browser';
import { NavigationRoutingModule } from './Routing/navigation-routing.module';
import { FooterComponent } from './Components/footer/footer.component';
import { HomeComponent } from './Components/home/home.component';
import { AuthLoginComponent } from '../AuthModule/Components/auth-login/auth-login.component';



@NgModule({
  declarations: [
    NavbarComponent,
    NavigationComponent,
    FooterComponent,
    HomeComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    SharedModule,
    NavigationRoutingModule
  ],
  providers: [],
  exports: [
    NavigationComponent,
    FooterComponent,
    HomeComponent
  ]
})
export class NavigationModule { }
