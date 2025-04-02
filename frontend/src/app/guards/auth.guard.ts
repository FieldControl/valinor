import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, map, take, of, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    // Verificar se já temos token no sessionStorage
    const sessionToken = sessionStorage.getItem('auth_token');
    
    if (sessionToken) {
      console.log('Token encontrado no sessionStorage, permitindo acesso');
      return of(true);
    }
    
    // Verificar no localStorage do Firebase
    try {
      const apiKey = this.authService.getFirebaseConfig(); // Usar o método do serviço de autenticação
      const storageKey = `firebase:authUser:${apiKey}:[DEFAULT]`;
      const userDataStr = localStorage.getItem(storageKey);
      
      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
          if (userData && userData.stsTokenManager && userData.stsTokenManager.accessToken) {
            const expirationTime = userData.stsTokenManager.expirationTime;
            const currentTime = Date.now();
            
            if (expirationTime > currentTime) {
              console.log('Token válido encontrado no localStorage, permitindo acesso');
              // Salvar também no sessionStorage para futuros acessos
              sessionStorage.setItem('auth_token', userData.stsTokenManager.accessToken);
              return of(true);
            }
          }
        } catch (e) {
          console.error('Erro ao analisar dados do localStorage');
        }
      }
    } catch (error) {
      console.error('Erro ao verificar localStorage');
    }
    
    // Se não encontrou token válido no storage, verificar com o auth service
    return this.authService.isLoggedIn.pipe(
      take(1),
      map(isAuthenticated => {
        if (isAuthenticated) {
          return true;
        }
        console.log('Usuário não autenticado, redirecionando para login');
        return this.router.createUrlTree(['/login']);
      })
    );
  }
} 