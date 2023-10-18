import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { UserLoginComponent } from './user-login/user-login.component';
import { StarLabelComponent } from './star-label/star-label.component';
import { RepositoryCardComponent } from './repository-card/repository-card.component';
import { RepositoryInfosComponent } from './repository-infos/repository-infos.component';
import { MenuComponent } from './menu/menu.component';
import { HomeComponent } from './home/home.component';
import { CodigoTagComponent } from './codigo-tag/codigo-tag.component';
import { UserStarBtnComponent } from './user-star-btn/user-star-btn.component';
import { UserRepositoryComponent } from './user-repository/user-repository.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    UserLoginComponent,
    StarLabelComponent,
    RepositoryCardComponent,
    RepositoryInfosComponent,
    MenuComponent,
    HomeComponent,
    CodigoTagComponent,
    UserStarBtnComponent,
    UserRepositoryComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FontAwesomeModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
