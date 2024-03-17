import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { CookieService } from 'ngx-cookie-service';
import { Observable, map } from 'rxjs';
import { refreshTokenResponse } from 'src/app/models/interface/user/auth/response/refreshToken';
import { UserResponse } from 'src/app/models/interface/user/user/response/UserResponse';
import { AuthRequest } from '../../models/interface/user/auth/request/AuthRequest';
import { AuthResponse } from '../../models/interface/user/auth/response/AuthResponse';
import { createUserRequest } from '../../models/interface/user/signUp/request/createUserRequest';
import { createUserResponse } from '../../models/interface/user/signUp/response/createUserResponse';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private apollo: Apollo, private cookie: CookieService) {}

  private getJwtToken(): string {
    return this.cookie.get('token');
  }

  auth({ email, password }: AuthRequest): Observable<AuthResponse> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation Login($email: String!, $password: String!) {
            login(data: { email: $email, password: $password }) {
              user {
                id
                name
                email
              }
              token
            }
          }
        `,
        variables: {
          email,
          password,
        },
      })
      .pipe(map((result: any) => result.data.login as AuthResponse));
  }

  create({
    name,
    email,
    password,
  }: createUserRequest): Observable<createUserResponse> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateUser(
            $name: String!
            $email: String!
            $password: String!
          ) {
            createUser(
              data: { name: $name, email: $email, password: $password }
            ) {
              id
              name
              email
            }
          }
        `,
        variables: {
          name,
          email,
          password,
        },
      })
      .pipe(map((result: any) => result.data.createUser as createUserResponse));
  }

  getAllUsers(): Observable<Array<UserResponse>> {
    const JWT_TOKEN = this.getJwtToken();
    const headers = {
      Authorization: `Bearer ${JWT_TOKEN}`,
    };
    const query = gql`
      query GetAllUsers {
        users {
          id
          name
        }
      }
    `;

    return this.apollo
      .query<Array<UserResponse>>({
        query: query,
        context: {
          headers: headers,
        },
      })
      .pipe(map((result: any) => result.data.users as UserResponse[]));
  }

  refreshToken(): Observable<refreshTokenResponse> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation revalidateToken {
            token
          }
        `,
      })
      .pipe(map((result: any) => result.data.token as refreshTokenResponse));
  }

  isLoggedIn(): boolean {
    const JWT_TOKEN = this.cookie.get('token');
    return JWT_TOKEN ? true : false;
  }
}
