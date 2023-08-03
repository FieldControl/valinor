import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { SearchItemsComponent } from './search-items/search-items.component';
import { GithubApiService } from './github-api.service';
import { RepositoryItemComponent } from './repository-item/repository-item.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    SearchItemsComponent,
    RepositoryItemComponent,
    
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [GithubApiService],
  bootstrap: [AppComponent]
})
export class AppModule { }
