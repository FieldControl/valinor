import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http'
import { AppRoutingModule } from './app-routing.module';


import { AppComponent } from './app.component';
import { CharacterListComponent } from './character-list/character-list.component';
import { CardCharcacterComponent } from './card-charcacter/card-charcacter.component';
import { RicktyService } from '../app/services/rickty.service';
import { HeaderAppComponent } from './header-app/header-app.component';
import { CardDetailsComponent } from './card-details/card-details.component';
import { HomeComponent } from './home/home.component';


import { NgxPaginationModule } from 'ngx-pagination';



@NgModule({
  declarations: [
    AppComponent,
    CharacterListComponent,
    CardCharcacterComponent,
    HeaderAppComponent,
    CardDetailsComponent,
    HomeComponent,
    
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule, 
    RouterModule,
    NgxPaginationModule
    
  ],
  providers: [RicktyService,
    CharacterListComponent],
    
  bootstrap: [AppComponent]
})
export class AppModule { }
