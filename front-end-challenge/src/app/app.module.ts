import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { EmojifyModule } from 'angular-emojify';
import { ToastrModule } from 'ngx-toastr';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { CustomHttpInterceptor } from './interceptors/custom-http.interceptor';
import { HomeComponent } from './pages/home/home.component';
import { CoreHttpService } from './services/core-http/core-http.service';
import { LoadingService } from './services/loading/loading.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';

const defaultModules = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  HttpClientModule,
  MatPaginatorModule,
  MatCardModule,
  MatListModule,
  EmojifyModule,
];

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ToastrModule.forRoot(),
    ...defaultModules,
    BrowserAnimationsModule
  ],
  exports: [
    ...defaultModules,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: CustomHttpInterceptor, multi: true },
    CoreHttpService,
    LoadingService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
