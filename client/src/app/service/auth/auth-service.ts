import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

interface LoginResponse {
  data: {
    login: {
      access_token: string;
      user: {
        id: number;
        name: string;
        email: string;
        createdAt: string;
      }
    }
  }
}

interface RegisterResponse {
  data: {
    createUser: {
      name: string;
      email: string;
    }
  }
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:3000/graphql';

  constructor(
    private http: HttpClient
  ) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.apiUrl, {
      query: `
        mutation Login($loginInput: LoginInput!){
          login(loginInput: $loginInput) {
            access_token
            user {
              id
              name
              email
              createdAt
            }
          }
        }
      `,
      variables: {
        loginInput: {
          email,  
          password
        }
      }
    });
  }

  register(name: string, email: string, password: string): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(this.apiUrl, {
      query: `
        mutation CreateUser($createUserInput: CreateUserInput!){
          createUser(createUserInput: $createUserInput) {
            id
            name
            email
            createdAt
          }
        }
      `,
      variables: {
        createUserInput: {
          name,
          email,
          password
        }
      }
    });
  }
}