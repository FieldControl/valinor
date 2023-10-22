import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './Components/header/header.component';
import { UserLoginComponent } from './Components/Sub_Components/user-login/user-login.component';
import { StarLabelComponent } from './Components/Sub_Components/star-label/star-label.component';
import { RepositorioCardComponent } from './Components/RepositorioCard/RepositorioCard.component';
import { RepositorioCardFooter } from './Components/Sub_Components/RepositorioCardFooter/RepositorioCardFooter.component';
import { MenuComponent } from './Components/menu/menu.component';
import { HomeComponent } from './Components/home/home.component';
import { CodigoTagComponent } from './codigo-tag/codigo-tag.component';
import { UserStarBtnComponent } from './Components/Sub_Components/user-star-btn/user-star-btn.component';
import { RepositorioCardHeaderComponent } from './Components/Sub_Components/RepositorioCardHeader/RepositorioCardHeader.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ApigitService } from './services/apigit.service';
import { HttpClientModule } from '@angular/common/http';
import { SharedDateService } from './services/SharedData.service';


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    UserLoginComponent,
    StarLabelComponent,
    RepositorioCardComponent,
    RepositorioCardFooter,
    MenuComponent,
    HomeComponent,
    CodigoTagComponent,
    UserStarBtnComponent,
    RepositorioCardHeaderComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FontAwesomeModule,
    FormsModule,
    
  ],
  providers: [ApigitService,HttpClientModule,SharedDateService],
  bootstrap: [AppComponent]
})
export class AppModule { }
