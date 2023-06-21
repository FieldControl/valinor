import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http'

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SearchComponentComponent } from './components/search-component/search-component.component';
import { RepositoriosComponentComponent } from './components/repositorios-component/repositorios-component.component';
import { PaginasComponentComponent } from './components/paginas-component/paginas-component.component';

@NgModule({
  declarations: [
    AppComponent,
    SearchComponentComponent,
    RepositoriosComponentComponent,
    PaginasComponentComponent
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
