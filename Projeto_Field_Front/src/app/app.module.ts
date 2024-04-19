import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatTableModule } from '@angular/material/table';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { CadastroComponent } from './cadastro/cadastro.component';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { ListarComponent } from './listar/listar.component';

@NgModule({
  declarations: [
    AppComponent,
    CadastroComponent,
    ListarComponent
  ],
  imports: [BrowserModule, MatTableModule, BrowserAnimationsModule, HttpClientModule,FormsModule,AppRoutingModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
