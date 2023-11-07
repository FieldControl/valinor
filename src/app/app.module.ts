import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PokedexComponent } from './pokedex/pokedex.component';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { InformacoesPokemonComponent } from './informacoes-pokemon/informacoes-pokemon.component';
import { MatDialogModule } from '@angular/material/dialog';
import { AlertaNaoEncontradoComponent } from './alerta-nao-encontrado/alerta-nao-encontrado.component';


@NgModule({
  declarations: [
    AppComponent,
    PokedexComponent,
    InformacoesPokemonComponent,
    AlertaNaoEncontradoComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    MatDialogModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
