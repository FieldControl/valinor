import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { apiService } from './service.service';
import { AgentListComponent } from './components/agent-list/agent-list.component';
import { BundleListComponent } from './components/bundle-list/bundle-list.component';
import { HeaderComponent } from './components/header/header.component';
import { CarouselComponent } from './components/carousel/carousel.component';
import { ChooseComponent } from './components/choose/choose.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatPaginatorModule } from '@angular/material/paginator';

@NgModule({
  declarations: [
    AppComponent,
    AgentListComponent,
    BundleListComponent,
    HeaderComponent,
    CarouselComponent,
    ChooseComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatPaginatorModule
  ],
  providers: [apiService],
  bootstrap: [AppComponent]
})



export class AppModule { }
