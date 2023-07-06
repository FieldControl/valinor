import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ListaRepositoriosComponent } from './repositorios/lista-repositorios/lista-repositorios.component';
import { HttpClientModule } from '@angular/common/http';
import { LoaderComponent } from './shared/loader/loader.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { ListaIssuesComponent } from './issues/lista-issues/lista-issues.component';

@NgModule({
  declarations: [
    AppComponent,
    ListaRepositoriosComponent,
    LoaderComponent,
    ListaIssuesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
