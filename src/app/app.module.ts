import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import localePT from '@angular/common/locales/pt';
import { registerLocaleData } from '@angular/common';
import { NgIconsModule } from '@ng-icons/core'

import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { SearchComponent } from './components/search/search.component';
import { ListComponent } from './components/list/list.component';
import { CardComponent } from './components/card/card.component';
import { UserComponent } from './components/user/user.component';
import { PaginationComponent } from './components/pagination/pagination.component';
import { ProgressBarComponent } from './components/progress-bar/progress-bar.component';
import { RepositoryComponent } from './components/repository/repository.component';
import { ModalErrorComponent } from './components/modal-error/modal-error.component';
import { ionStarOutline, ionGitNetworkOutline, ionPeopleOutline, ionEyeOutline, ionJournalOutline, ionEllipsisVertical, ionLogOutOutline, ionCalendarOutline, ionTimeOutline, ionGitMergeOutline, ionChevronDownOutline } from '@ng-icons/ionicons'
import { heroChevronLeft, heroChevronRight, heroChevronDoubleLeft, heroChevronDoubleRight, heroArrowLeft, heroArrowUpTray, heroMapPin, heroXMark } from '@ng-icons/heroicons/outline'

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
    ModalErrorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgIconsModule.withIcons({ ionStarOutline, ionGitNetworkOutline, ionPeopleOutline, ionEyeOutline, ionJournalOutline, ionEllipsisVertical, ionLogOutOutline, heroChevronLeft, heroChevronRight, heroChevronDoubleLeft, heroChevronDoubleRight, heroArrowLeft, ionCalendarOutline, ionTimeOutline, heroArrowUpTray, ionGitMergeOutline, heroMapPin, ionChevronDownOutline, heroXMark })
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'pt-BR' },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
