import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HomeComponent } from './views/home/home.component';
import {MatInputModule} from '@angular/material/input';
import {MatPaginatorModule} from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { GithubApiService } from './shared/services/github-api.service';
import {MatButtonModule} from '@angular/material/button';
import { ShowGithubRepositoryComponent } from './views/home/show-github-repository/show-github-repository.component';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ShowGithubRepositoryComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatPaginatorModule,
    FormsModule,
    HttpClientModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatCardModule,
    NgxPaginationModule
  ],
  providers: [GithubApiService],
  bootstrap: [AppComponent]
})
export class AppModule { }
