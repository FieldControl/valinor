import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { CookieService } from 'ngx-cookie-service';
import { Observable, map } from 'rxjs';
import { CreateCardRequest } from 'src/app/models/interface/card/request/CreateCardRequest';
import { EditCardRequest } from 'src/app/models/interface/card/request/EditCardRequest';
import { EditColumnToCard } from 'src/app/models/interface/card/request/EditColumnToCard';
import { CardsResponse } from 'src/app/models/interface/card/response/CardsResponse';

@Injectable({
  providedIn: 'root',
})
export class CardService {
  private JWT_TOKEN = this.cookieService.get('token');
  private headers = {
    Authorization: `Bearer ${this.JWT_TOKEN}`,
  };

  constructor(private apollo: Apollo, private cookieService: CookieService) {}

  getAllCards(): Observable<Array<CardsResponse>> {
    const query = gql`
      query GetAllCards {
        cards {
          id
          title
          description
          columnsTable {
            id
          }
          user {
            id
            name
          }
        }
      }
    `;

    return this.apollo
      .query<Array<CardsResponse>>({
        query: query,
        context: {
          headers: this.headers,
        },
      })
      .pipe(map((result: any) => result.data.cards as CardsResponse[]));
  }

  createCard({
    title,
    description,
    column,
    user,
  }: CreateCardRequest): Observable<CardsResponse> {
    {
      return this.apollo
        .mutate({
          mutation: gql`
            mutation createCard(
              $title: String!
              $description: String!
              $column: String!
              $user: String!
            ) {
              createCard(
                data: {
                  title: $title
                  description: $description
                  column: $column
                  user: $user
                }
              ) {
                id
                title
                description
                columnsTable {
                  id
                }
                user {
                  id
                  name
                }
              }
            }
          `,
          variables: {
            title,
            description,
            column,
            user,
          },
          context: {
            headers: this.headers,
          },
        })
        .pipe(map((result: any) => result.data.createCard as CardsResponse));
    }
  }

  editCard({
    id,
    title,
    description,
  }: EditCardRequest): Observable<CardsResponse> {
    {
      return this.apollo
        .mutate({
          mutation: gql`
            mutation updateCard(
              $id: String!
              $title: String!
              $description: String!
            ) {
              updateCard(
                id: $id
                data: { title: $title, description: $description }
              ) {
                id
                title
                description
                columnsTable {
                  id
                }
                user {
                  id
                  name
                }
              }
            }
          `,
          variables: {
            title,
            description,
            id,
          },
          context: {
            headers: this.headers,
          },
        })
        .pipe(map((result: any) => result.data.updateCard as CardsResponse));
    }
  }

  editUserToCard({ id, user }: EditCardRequest): Observable<CardsResponse> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation updateUserToCard($id: String!, $user: String!) {
            updateUserToCard(id: $id, data: { user: $user }) {
              id
              title
              description
              columnsTable {
                id
              }
              user {
                id
                name
              }
            }
          }
        `,
        variables: {
          id: id,
          user: user,
        },
        context: {
          headers: this.headers,
        },
      })
      .pipe(
        map((result: any) => result.data.updateUserToCard as CardsResponse)
      );
  }

  editColumnToCard({
    id,
    column,
  }: EditColumnToCard): Observable<CardsResponse> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateColumnToCard($id: String!, $column: String!) {
            UpdateColumnToCard(id: $id, data: { column: $column }) {
              id
              title
              description
              columnsTable {
                id
              }
              user {
                id
                name
              }
            }
          }
        `,
        variables: {
          id: id,
          column: column,
        },
        context: {
          headers: this.headers,
        },
      })
      .pipe(
        map((result: any) => result.data.UpdateColumnToCard as CardsResponse)
      );
  }

  deleteCard(id: string): Observable<boolean> {
    {
      return this.apollo
        .mutate({
          mutation: gql`
            mutation deleteCard($id: String!) {
              deleteCard(id: $id)
            }
          `,
          variables: {
            id,
          },
          context: {
            headers: this.headers,
          },
        })
        .pipe(map((result: any) => result.data.deleteCard as boolean));
    }
  }
}
