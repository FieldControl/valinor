//Importação dos Módulos
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
//Este módulo foi instalado para realizar a páginação.
import { NgxPaginationModule } from 'ngx-pagination';

//importação dos Components
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { MainComponent } from './components/main/main.component';
import { RepositoryCardComponent } from './components/repository-card/repository-card.component';
import { TopicsComponent } from './components/topics/topics.component';

//Importação dos Serviços
import { GitRepositoryService } from './services/git-repository.service';


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    MainComponent,
    RepositoryCardComponent,
    TopicsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule
  ],
  providers: [
    HttpClientModule,
    GitRepositoryService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
