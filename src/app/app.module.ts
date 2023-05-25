import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgxPaginationModule } from 'ngx-pagination';
import { MenuBuscaComponent } from './menu-busca/menu-busca.component';
import { FiltrosComponent } from './filtros/filtros.component';
import { RepositoriosComponent } from './repositorios/repositorios.component';
import { TopicosComponent } from './topicos/topicos.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    MenuBuscaComponent,
    FiltrosComponent,
    RepositoriosComponent,
    TopicosComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    NgxPaginationModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
