import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { apiService } from './service.service';
import { AgentListComponent } from './components/lists/agent-list/agent-list.component';
import { BundleListComponent } from './components/lists/bundle-list/bundle-list.component';
import { HeaderComponent } from './components/header/header.component';
import { MainPageComponent } from './components/main-page/main-page.component';
import { ChooseComponent } from './components/choose/choose.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { SkinListComponent } from './components/lists/skin-list/skin-list.component';
import { ChooseHeaderComponent } from './components/choose-header/choose-header.component';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [ 
    AppComponent,
    AgentListComponent,
    BundleListComponent,
    HeaderComponent,
    MainPageComponent,
    ChooseComponent,
    SkinListComponent,
    ChooseHeaderComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatPaginatorModule,
    CommonModule,
    MatPaginatorModule
  ],
  providers: [apiService, HttpClient, MatPaginatorModule],
  bootstrap: [AppComponent]
})



export class AppModule { }
