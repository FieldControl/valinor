import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { AppRoutingModule } from './app-routing.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AppComponent } from './app.component';
import { PesquisaComponent } from './components/pesquisa/pesquisa.component';
import { RepositorioListaComponent } from './components/repositorio-lista/repositorio-lista.component';
import { IconsModule } from './icons/icons.module';
import { NumeroCurtoPipe } from './pipes/numero-curto.pipe';
import { LogoFieldComponent } from './components/logo-field/logo-field.component';

@NgModule({
  declarations: [
    AppComponent,
    PesquisaComponent,
    RepositorioListaComponent,
    NumeroCurtoPipe,
    LogoFieldComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    IconsModule,
    BrowserAnimationsModule,
    FontAwesomeModule,
    ToastrModule.forRoot({
      timeOut: 10000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
    }),
  ],
  providers: [],
  exports: [FontAwesomeModule],
  bootstrap: [AppComponent],
})
export class AppModule {}