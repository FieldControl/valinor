import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { map, switchMap, tap, catchError } from 'rxjs/operators';
import { 
  Auth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  authState,
  User,
  UserCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private tokenSubject = new BehaviorSubject<string | null>(null);
  public token$ = this.tokenSubject.asObservable();
  
  // Armazenar o último token válido para uso síncrono
  private lastKnownToken: string | null = null;

  constructor(
    private auth: Auth,
    private router: Router
  ) {
    // Recuperar qualquer token salvo no storage ao iniciar
    this.tryRecoverToken();
    
    // Verificar se já temos um usuário autenticado no Firebase Auth
    if (this.auth.currentUser) {
      this.currentUserSubject.next(this.auth.currentUser);
      
      // Obter token do usuário atual
      this.auth.currentUser.getIdToken().then(token => {
        this.lastKnownToken = token;
        this.tokenSubject.next(token);
        sessionStorage.setItem('auth_token', token);
      }).catch(error => {
        console.error('Erro ao obter token');
      });
    }
    
    // Monitorar mudanças no estado de autenticação
    authState(this.auth).pipe(
      switchMap(user => {
        if (user) {
          this.currentUserSubject.next(user);
          return from(user.getIdToken());
        } else {
          // Verificar no sessionStorage antes de confirmar que não há usuário
          const sessionToken = sessionStorage.getItem('auth_token');
          if (sessionToken) {
            // Manter o token mas não atualizar o usuário
            return of(sessionToken);
          }
          
          // Realmente não há usuário autenticado
          this.currentUserSubject.next(null);
          return of(null);
        }
      }),
      catchError(error => {
        console.error('Erro ao obter estado de autenticação');
        return of(null);
      })
    ).subscribe(token => {
      if (token) {
        this.lastKnownToken = token;
        this.tokenSubject.next(token);
        
        // Salvar o token no sessionStorage para persistência entre recargas de página
        sessionStorage.setItem('auth_token', token);
      } else {
        // Não limpar o token do sessionStorage aqui para permitir recarregar a página
        // Somente limpa o token atual
        this.lastKnownToken = null;
        this.tokenSubject.next(null);
      }
    });
  }

  // Tentar recuperar um token válido do armazenamento
  private tryRecoverToken(): void {
    try {
      // Verificar no sessionStorage primeiro (nossa própria persistência)
      const savedToken = sessionStorage.getItem('auth_token');
      if (savedToken) {
        this.lastKnownToken = savedToken;
        this.tokenSubject.next(savedToken);
        return;
      }
      
      // Se não encontrar no sessionStorage, tentar localStorage (Firebase)
      const storageKey = `firebase:authUser:${this.getFirebaseConfig()}:[DEFAULT]`;
      const userDataStr = localStorage.getItem(storageKey);
      
      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
          if (userData && userData.stsTokenManager && userData.stsTokenManager.accessToken) {
            // Verificar se o token expirou
            const expirationTime = userData.stsTokenManager.expirationTime;
            const currentTime = Date.now();
            
            if (expirationTime > currentTime) {
              this.lastKnownToken = userData.stsTokenManager.accessToken;
              this.tokenSubject.next(userData.stsTokenManager.accessToken);
              
              // Também salvar no sessionStorage para redundância
              sessionStorage.setItem('auth_token', userData.stsTokenManager.accessToken);
              return;
            } else {
              console.warn('Token encontrado está expirado');
            }
          }
        } catch (e) {
          console.error('Erro ao analisar dados do usuário');
        }
      }
    } catch (error) {
      console.error('Erro ao tentar recuperar token');
    }
  }

  // Extrair a configuração do Firebase para uso na chave de armazenamento
  public getFirebaseConfig(): string {
    // Usar o valor da configuração do window.ENV ou fallback para o environment
    return (window as any).ENV?.firebase?.apiKey || environment.firebase.apiKey;
  }

  register(email: string, password: string): Observable<UserCredential> {
    return from(createUserWithEmailAndPassword(this.auth, email, password))
      .pipe(
        tap(userCredential => {
          // Remover informações sensíveis dos logs
        }),
        catchError(error => {
          console.error('Erro ao registrar usuário');
          throw error;
        })
      );
  }

  login(email: string, password: string): Observable<UserCredential> {
    // Limpar os storages antes de tentar login para evitar conflitos
    const storageKey = `firebase:authUser:${this.getFirebaseConfig()}:[DEFAULT]`;
    try {
      // Limpar quaisquer sessões antigas para evitar problemas com tokens expirados
      sessionStorage.removeItem('auth_token');
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Erro ao limpar dados de sessão anterior');
    }
    
    return from(signInWithEmailAndPassword(this.auth, email, password))
      .pipe(
        tap(userCredential => {
          // Quando login é bem-sucedido, salvar token
          userCredential.user.getIdToken()
            .then(token => {
              if (token) {
                this.lastKnownToken = token;
                this.tokenSubject.next(token);
                sessionStorage.setItem('auth_token', token);
              }
            })
            .catch(error => {
              console.error('Erro ao obter token após login');
            });
        }),
        catchError(error => {
          console.error('Erro ao fazer login');
          
          // Redefina o estado de autenticação em caso de erro
          this.lastKnownToken = null;
          this.tokenSubject.next(null);
          
          // Se for erro de credencial inválida, limpar tentativas anteriores
          if (error.code === 'auth/invalid-credential') {
            this.resetLocalBoard();
            sessionStorage.removeItem('auth_token');
            localStorage.removeItem(storageKey);
          }
          
          throw error;
        })
      );
  }

  logout(): Observable<void> {
    // Limpar tokens armazenados antes de fazer logout
    this.lastKnownToken = null;
    this.tokenSubject.next(null);
    
    // Limpar todos os storages
    sessionStorage.removeItem('auth_token');
    
    // Limpar também o localStorage do Firebase (opcional)
    try {
      const storageKey = `firebase:authUser:${this.getFirebaseConfig()}:[DEFAULT]`;
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Erro ao limpar localStorage');
    }
    
    return from(signOut(this.auth))
      .pipe(
        tap(() => {
          // Limpar o usuário no subject
          this.currentUserSubject.next(null);
          
          // Redirecionar para a página de login
          this.router.navigateByUrl('/login');
        }),
        catchError(error => {
          console.error('Erro ao fazer logout');
          throw error;
        })
      );
  }

  // Método para obter o token atual de forma síncrona
  getToken(): string | null {
    try {
      // Tentar primeiro obter o token do BehaviorSubject
      if (this.lastKnownToken) {
        return this.lastKnownToken;
      }
      
      // Se não tiver token em memória, tentar buscar do sessionStorage
      const sessionToken = sessionStorage.getItem('auth_token');
      if (sessionToken) {
        this.lastKnownToken = sessionToken;
        return sessionToken;
      }
      
      // Por último, tentar recuperar do localStorage do Firebase
      const storageKey = `firebase:authUser:${this.getFirebaseConfig()}:[DEFAULT]`;
      const userDataStr = localStorage.getItem(storageKey);
      
      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
          if (userData && userData.stsTokenManager && userData.stsTokenManager.accessToken) {
            // Verificar se o token expirou
            const expirationTime = userData.stsTokenManager.expirationTime;
            const currentTime = Date.now();
            
            if (expirationTime > currentTime) {
              this.lastKnownToken = userData.stsTokenManager.accessToken;
              return userData.stsTokenManager.accessToken;
            } else {
              console.warn('Token expirado');
              return null;
            }
          }
        } catch (e) {
          console.error('Erro ao processar dados do localStorage');
        }
      }
      
      console.warn('Nenhum token válido encontrado');
      return null;
    } catch (error) {
      console.error('Erro ao obter token');
      return null;
    }
  }

  // Método para limpar qualquer dado de sessão anterior que possa estar causando problemas
  resetLocalBoard(): void {
    try {
      // Limpar localstorage e sessionstorage para resolver problemas de token/credenciais
      localStorage.clear();
      sessionStorage.clear();
      
      // Resetar os subjects para garantir estado limpo
      this.lastKnownToken = null;
      this.tokenSubject.next(null);
      this.currentUserSubject.next(null);
      
      console.log('Dados locais e sessão foram limpos para resolver problemas de autenticação');
    } catch (error) {
      console.error('Erro ao limpar dados locais', error);
    }
  }

  // Método para obter o token como Observable (para compatibilidade)
  getTokenAsync(): Observable<string | null> {
    return this.token$;
  }

  sendVerificationEmail(): Observable<void> {
    const user = this.auth.currentUser;
    if (!user) {
      return of(undefined);
    }
    return from(sendEmailVerification(user)).pipe();
  }

  resetPassword(email: string): Observable<void> {
    return from(sendPasswordResetEmail(this.auth, email)).pipe();
  }

  updateUserProfile(displayName?: string | null, photoURL?: string | null): Observable<void> {
    const user = this.auth.currentUser;
    if (!user) {
      return of(undefined);
    }
    return from(updateProfile(user, { displayName, photoURL })).pipe();
  }

  updateUserPassword(newPassword: string): Observable<void> {
    const user = this.auth.currentUser;
    if (!user) {
      return of(undefined);
    }
    return from(updatePassword(user, newPassword)).pipe();
  }

  get isLoggedIn(): Observable<boolean> {
    // Verificar primeiro se o usuário já está autenticado na sessão
    if (this.auth.currentUser) {
      return of(true);
    }
    
    // Verificar se temos um token válido no sessionStorage
    const sessionToken = sessionStorage.getItem('auth_token');
    if (sessionToken) {
      return of(true);
    }
    
    // Verificar no localStorage do Firebase
    try {
      const storageKey = `firebase:authUser:${this.getFirebaseConfig()}:[DEFAULT]`;
      const userDataStr = localStorage.getItem(storageKey);
      
      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
          if (userData && userData.stsTokenManager && userData.stsTokenManager.accessToken) {
            const expirationTime = userData.stsTokenManager.expirationTime;
            const currentTime = Date.now();
            
            if (expirationTime > currentTime) {
              // Salvar também no sessionStorage para futuros acessos
              sessionStorage.setItem('auth_token', userData.stsTokenManager.accessToken);
              return of(true);
            }
          }
        } catch (e) {
          console.error('Erro ao processar dados');
        }
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação');
    }
    
    // Por último, verificar com o observable do Firebase Auth
    return this.currentUser$.pipe(
      map(user => !!user)
    );
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get userEmail(): string | null {
    return this.currentUser?.email || null;
  }

  // Verifica e renova o token se necessário
  checkAndRefreshToken(): Observable<string | null> {
    // Se houver um usuário atualmente logado
    if (this.auth.currentUser) {
      return from(this.auth.currentUser.getIdToken(true))
        .pipe(
          tap(newToken => {
            this.lastKnownToken = newToken;
            this.tokenSubject.next(newToken);
            sessionStorage.setItem('auth_token', newToken);
            console.log('Token renovado com sucesso');
          }),
          catchError(error => {
            console.error('Erro ao renovar token:', error);
            return of(null);
          })
        );
    }
    
    return of(this.getToken());
  }
} 