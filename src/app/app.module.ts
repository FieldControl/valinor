import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NavbarComponent } from './components/navbar/navbar.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { RepoService } from './services/repo.service';
import { IssuesService } from './services/issues.service';
import { SidenavComponent } from './components/sidenav/sidenav.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { PageResultsComponent } from './components/page-results/page-results.component';
import { DrawerService } from './services/drawer.service';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ShowSearchResultsService } from './services/show-search-results.service';
import { FooterComponent } from './components/footer/footer.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    SidenavComponent,
    PageResultsComponent,
    FooterComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    FormsModule,
    CommonModule,
    HttpClientModule,
    MatPaginatorModule,
  ],
  providers: [RepoService, IssuesService, DrawerService, ShowSearchResultsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
