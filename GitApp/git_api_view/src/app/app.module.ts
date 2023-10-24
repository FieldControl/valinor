import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './Components/header/header.component';
import { UserLoginComponent } from './Components/Sub_Components/user-login/user-login.component';
import { RepositorioCardComponent } from './Components/RepositorioCard/RepositorioCard.component';
import { RepositorioCardFooter } from './Components/Sub_Components/RepositorioCardFooter/RepositorioCardFooter.component';
import { HomeComponent } from './Components/home/home.component';
import { CodigoTagComponent } from './Components/Sub_Components/TopicsTags/TopicsTags.component';
import { UserStarBtnComponent } from './Components/Sub_Components/user-star-btn/user-star-btn.component';
import { RepositorioCardHeaderComponent } from './Components/Sub_Components/RepositorioCardHeader/RepositorioCardHeader.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ApigitService } from './services/apigit.service';
import { HttpClientModule } from '@angular/common/http';
import { SharedDateService } from './services/SharedData.service';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    UserLoginComponent,
    RepositorioCardComponent,
    RepositorioCardFooter,
   
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
    NgxPaginationModule,
  ],
  providers: [ApigitService,HttpClientModule,SharedDateService],
  bootstrap: [AppComponent]
})
export class AppModule { }
