import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { EmojifyModule } from 'angular-emojify';
import { ToastrModule } from 'ngx-toastr';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CustomHttpInterceptor } from './interceptors/custom-http.interceptor';
import { CoreHttpService } from './services/core-http/core-http.service';
import { LoadingService } from './services/loading/loading.service';

const defaultModules = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  HttpClientModule,
  MatPaginatorModule,
  MatCardModule,
  MatListModule,
  EmojifyModule,
  ToastrModule.forRoot()
];

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ...defaultModules
  ],
  exports: [
    ...defaultModules
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: CustomHttpInterceptor, multi: true },
    CoreHttpService,
    LoadingService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
