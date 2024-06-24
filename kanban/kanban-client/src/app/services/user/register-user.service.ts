import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { gql } from 'apollo-angular';
import { IUser } from '../../interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private apollo: Apollo) {}

  register(name: string, email: string, password: string) {
    if (
      !name ||
      typeof name !== 'string' ||
      !email ||
      typeof email !== 'string' ||
      !password ||
      typeof password !== 'string'
    ) {
      throw new Error('Name, email, and password must be provided as strings.');
    }

    return this.apollo.mutate<{ registerUser: IUser }>({
      mutation: gql`
        mutation RegisterUser(
          $name: String!
          $email: String!
          $password: String!
        ) {
          createUser(
            createUserInput: { name: $name, email: $email, password: $password }
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
    });
  }
}
