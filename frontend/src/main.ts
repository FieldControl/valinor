import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { importProvidersFrom } from '@angular/core';

// Importa o AppComponent e os módulos necessários para a aplicação
bootstrapApplication(AppComponent , {
  providers: [
    importProvidersFrom(FormsModule),
    provideHttpClient(),
  ]
})
