import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AuthToken, SignInCommand } from '@core/interfaces';
import { LocalStorageService } from '@core/services';
import { environment } from '@env/environment.development';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private endpoint = environment.serverURL + 'auth';

  constructor(
    private http: HttpClient,
    private router: Router,
    private storageService: LocalStorageService,
    private jwt: JwtHelperService
  ) {}

  signIn(signIn: SignInCommand): void {
    // return this.http
    //   .post<AuthToken>(this.endpoint + '/signin', signIn)
    //   .pipe(tap(token => this.storageService.set('token', token.access_token)));

    this.storageService.set(
      'user',
      signIn.email.substring(0, signIn.email.indexOf('@'))
    );
    this.storageService.set('token', 'FakeTokenTest');
  }

  logOut(): void {
    this.storageService.remove('token');
    this.router.navigate(['auth/signin']);
  }

  isAuthenticated(): boolean | UrlTree {
    const token = this.storageService.get('token');
    if (token === undefined) return this.goToSignIn();
    // if (this.jwt.isTokenExpired(token)) {
    //   this.storageService.remove('token');
    //   return this.router.createUrlTree(['auth/signin']);
    // }
    return true;
  }

  private goToSignIn(): UrlTree {
    return this.router.createUrlTree(['auth/signin']);
  }
}
