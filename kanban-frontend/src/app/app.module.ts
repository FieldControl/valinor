import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { ColumnsComponent } from './columns/columns.component';

@NgModule({
  declarations: [
    AppComponent,        // componente raiz
    ColumnsComponent     // componente das colunas
  ],
  imports: [
    BrowserModule,       // necessário para rodar no navegador
    HttpClientModule,    // para chamadas HTTP ao backend
    FormsModule          // para usar [(ngModel)] nos inputs
  ],
  providers: [],
  bootstrap: [AppComponent] // inicia a aplicação pelo AppComponent
})
export class AppModule { }
