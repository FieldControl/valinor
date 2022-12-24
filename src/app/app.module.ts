import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { MenuComponent } from './menu/menu.component';
import { ResultsComponent } from './results/results.component';
import { PaginationComponent } from './pagination/pagination.component';
import { RepositoryResultsComponent } from './repository-results/repository-results.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from'@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    NavBarComponent,
    MenuComponent,
    ResultsComponent,
    PaginationComponent,
    RepositoryResultsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    TooltipModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
