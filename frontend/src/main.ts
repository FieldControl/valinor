import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { provideNgxMask } from 'ngx-mask'; // ✅ Adiciona o ngx-mask

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(HttpClientModule),
    provideNgxMask() // ✅ Registra o ngx-mask aqui
  ]
}).catch(err => console.error(err));
