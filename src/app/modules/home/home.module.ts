import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { SharedModule } from '@shared/shared.module';

import { HomeComponent } from './home.component';
import { RepoCardComponent } from './components/repo-card/repo-card.component';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  declarations: [HomeComponent, RepoCardComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    SharedModule,
    NgxPaginationModule,
  ],
})
export class HomeModule {}
