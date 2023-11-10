import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { SearchComponent } from './components/search/search.component';
import { ListComponent } from './components/list/list.component';
import { CardComponent } from './components/card/card.component';
import { UserComponent } from './components/user/user.component';
import localePT from '@angular/common/locales/pt';
import { LucideAngularModule, MoreVertical, ChevronDown, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, ExternalLink, ArrowLeft, BookMarked, Users2, Star, MapPin, CalendarDays, Eye, Stars, GitFork, ArrowUpFromLine, History, GitBranch } from 'lucide-angular';

import { registerLocaleData } from '@angular/common';
import { PaginationComponent } from './components/pagination/pagination.component';
import { ProgressBarComponent } from './components/progress-bar/progress-bar.component';
import { RepositoryComponent } from './components/repository/repository.component';
registerLocaleData(localePT);

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    SearchComponent,
    ListComponent,
    CardComponent,
    UserComponent,
    PaginationComponent,
    ProgressBarComponent,
    RepositoryComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    LucideAngularModule.pick({ MoreVertical, ChevronDown, ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight, ExternalLink, ArrowLeft, BookMarked, Users2, Star, MapPin, CalendarDays, Eye, Stars, GitFork, ArrowUpFromLine, History, GitBranch }),
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'pt-BR' },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
