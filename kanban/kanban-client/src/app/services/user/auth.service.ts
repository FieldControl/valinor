import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { gql } from 'apollo-angular';
import { ILoginUser } from '../../interfaces/loginUser.interface';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { IUser } from '../../interfaces/user.interface';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<IUser | null> =
    new BehaviorSubject<IUser | null>(null);
  currentUser$: Observable<IUser | null> =
    this.currentUserSubject.asObservable();

  constructor(private apollo: Apollo, private cookieService: CookieService) {
    this.loadUser();
  }

  loadUser() {
    const user = this.getUser();
    if (user) {
      this.currentUserSubject.next(user);
    }
  }

  login(email: string, password: string) {
    if (
      !email ||
      typeof email !== 'string' ||
      !password ||
      typeof password !== 'string'
    ) {
      throw new Error('Email and password must be provided as strings.');
    }

    return this.apollo
      .mutate<{ loginUser: ILoginUser }>({
        mutation: gql`
          mutation LoginUser($email: String!, $password: String!) {
            loginUser(loginUserInput: { email: $email, password: $password }) {
              access_token
              user {
                id
                name
                email
              }
            }
          }
        `,
        variables: {
          email,
          password,
        },
      })
      .pipe(
        tap((response) => {
          const user = response.data?.loginUser.user;
          const token = response.data?.loginUser.access_token;
          if (user && token) {
            const { id, name, email } = user;

            this.saveId(String(id));
            this.saveToken(String(token));
            this.saveUser(String(id), String(name), String(email));
            this.currentUserSubject.next(user);
          } else {
            console.log('No user data found.');
          }
        })
      );
  }

  logout(): void {
    return this.cookieService.delete('@access_token');
  }

  saveId(id: string): void {
    return this.cookieService.set('@userId', id);
  }

  saveUser(id: string, name: string, email: string): void {
    const user = { id, name, email };
    const userString = JSON.stringify(user);

    this.cookieService.set('@user', userString);
  }

  getUser(): any {
    const userString = this.cookieService.get('@user');
    if (userString) {
      return JSON.parse(userString);
    }
    return null;
  }

  saveUserId(id: string) {
    return this.cookieService.set('@userId', id);
  }

  saveToken(token: string) {
    this.cookieService.set('@access_token', token);
  }

  getToken() {
    return this.cookieService.get('@access_token');
  }

  decodeToken(token: string): any {
    try {
      const payloadBase64 = token.split('.')[1];

      const decodedPayload = atob(payloadBase64);

      return JSON.parse(decodedPayload);
    } catch (error) {
      console.error('Erro ao decodificar o token:', error);
      return null;
    }
  }

  isAuthenticated(): boolean {
    const token = this.getToken();

    if (!token) {
      return false;
    }

    const tokenPayload = this.decodeToken(token);
    if (!tokenPayload || !tokenPayload.exp) {
      return true;
    }

    const expirationDate = tokenPayload.exp * 1000;
    const currentDate = new Date().getTime();

    return currentDate > expirationDate;
  }
}
