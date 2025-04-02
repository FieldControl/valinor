import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { initializeApp } from 'firebase/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { provideFirebaseApp } from '@angular/fire/app';
import { getAnalytics } from 'firebase/analytics';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';
import { Apollo } from 'apollo-angular';

import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { authInterceptor } from './services/auth.interceptor';
import { GraphQLModule } from './graphql.module';

// Obter a configuração do Firebase de window.ENV ou fallback para environment
const firebaseConfig = (window as any).ENV?.firebase || environment.firebase;

// Configuração para desabilitar os avisos de Firebase API fora do contexto de injeção
(window as any).firebase = {
  ...(window as any).firebase,
  FIREBASE_APPCHECK_DEBUG_TOKEN: true,
  // Desativar avisos de Zone
  USE_EMULATOR: environment.useEmulators || false,
  // Desabilitar logs do Firebase Zone
  logLevel: 'silent',
  // Suprimir console.log durante a inicialização do Firebase
  INTERNAL_SUPRESS_VERBOSE_LOGGING: true
};

// Desabilitar logs verbosos do SDK do Firebase
// @ts-ignore - Acessar uma propriedade não documentada para suprimir logs
window.FIREBASE_APPCHECK_DEBUG_TOKEN = true;

// Inicializar o Firebase sem exibir credenciais no console
const firebaseApp = initializeApp(firebaseConfig);

// Inicializar o Analytics apenas em produção ou se necessário
if (environment.production) {
  const analytics = getAnalytics(firebaseApp);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withHashLocation()),
    provideAnimations(),
    provideHttpClient(withInterceptors([authInterceptor])),
    
    // Firebase
    provideFirebaseApp(() => firebaseApp),
    provideAuth(() => getAuth(firebaseApp)),
    provideFirestore(() => getFirestore(firebaseApp)),
    provideStorage(() => getStorage(firebaseApp)),
    
    // Adicionar configuração para desabilitar logs
    {
      provide: FIREBASE_OPTIONS,
      useValue: {
        ...firebaseConfig,
        logLevel: 'silent' // 'silent', 'error', 'warn', 'info', 'debug', 'verbose'
      }
    },
    
    // GraphQL
    importProvidersFrom(GraphQLModule),
    Apollo
  ]
}; 