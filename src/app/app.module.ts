import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SideNavbarComponent } from './side-navbar/side-navbar.component';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { HomeComponent } from '../app/pages/home/home.component';
import { CharactersComponent } from '../app/pages/characters/characters.component';
import { FilterBarComponent } from './filter-bar/filter-bar.component';
import { CharacterInformationComponent } from './character-information/character-information.component';

@NgModule({
  declarations: [
    AppComponent,
    SideNavbarComponent,
    FooterComponent,
    HeaderComponent,
    HomeComponent,
    CharactersComponent,
    FilterBarComponent,
    CharacterInformationComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    RouterModule.forRoot([
      {path: 'home', component: HomeComponent},
      {path: 'characters', component: CharactersComponent},
      {path: '', redirectTo: 'home', pathMatch: 'full'}
    ]),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
