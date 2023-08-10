import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgxPaginationModule } from 'ngx-pagination';

import { AppComponent } from './app.component';
import { FieldControlComponent } from './field-control/field-control.component';
import { GithubRepositoryService } from './github-repository.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material/card'
import { MatPaginatorModule } from '@angular/material/paginator';
import { MaxLengthPipe } from './max-length.pipe'
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {MatIconModule } from '@angular/material/icon'

@NgModule({
  declarations: [
    AppComponent,
    FieldControlComponent,
    MaxLengthPipe,
  ],

  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgxPaginationModule,
    BrowserAnimationsModule,
    MatCardModule,
    MatPaginatorModule,
    MatInputModule,
    MatSlideToggleModule
  ],

  providers: [GithubRepositoryService],
  bootstrap: [FieldControlComponent]
})
export class AppModule{}
