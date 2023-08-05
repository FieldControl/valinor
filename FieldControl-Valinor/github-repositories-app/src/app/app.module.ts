import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; // Adicione esta linha
import { NgxPaginationModule } from 'ngx-pagination';
import { AppComponent } from './app.component';
import { RepositorySearchComponent } from './repository-search/repository-search.component';
import { HttpClientModule } from '@angular/common/http';
import { GithubService } from './github.service';

@NgModule({
  declarations: [
    AppComponent,
    RepositorySearchComponent
  ],
  imports: [
    BrowserModule,
    FormsModule, // Adicione esta linha
    HttpClientModule,
    NgxPaginationModule
  ],
  providers: [GithubService],
  bootstrap: [AppComponent]
})
export class AppModule { }
