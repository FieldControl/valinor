import { bootstrapApplication } from "@angular/platform-browser"
import { provideAnimations } from "@angular/platform-browser/animations"
import { provideHttpClient, withInterceptors } from "@angular/common/http"
import { AppComponent } from "./app/app.component"
import { Apollo } from 'apollo-angular'
import { environment } from "./environments/environment"
import { provideRouter } from "@angular/router"
import { routes } from "./app/app.routes"
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getAuth, provideAuth } from '@angular/fire/auth'
import { getFirestore, provideFirestore } from '@angular/fire/firestore'
import { getStorage, provideStorage } from '@angular/fire/storage'
import { authInterceptor } from "./app/services/auth.interceptor"
import { GraphQLModule } from "./app/graphql.module"
import { provideFirebaseApp } from '@angular/fire/app'
import { importProvidersFrom } from "@angular/core"

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
};

// Inicializar o Firebase de forma silenciosa para evitar logs de configuração
const firebaseApp = initializeApp(firebaseConfig);

// Inicializar o Analytics apenas em produção ou se necessário
if (environment.production) {
  const analytics = getAnalytics(firebaseApp);
}

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter(routes),
    // Firebase
    provideFirebaseApp(() => firebaseApp),
    provideAuth(() => getAuth(firebaseApp)),
    provideFirestore(() => getFirestore(firebaseApp)),
    provideStorage(() => getStorage(firebaseApp)),
    // GraphQL
    importProvidersFrom(GraphQLModule),
    // Para permitir a injeção do Apollo
    Apollo
  ],
}).catch((err) => console.error(err))

