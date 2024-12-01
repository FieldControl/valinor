import { Injectable } from '@angular/core';
import { GraphqlService } from '../services/graphql.service';
import { gql } from '@apollo/client/core';
import { CreateColumn, UpdateColumn } from '../shared/models/column';

@Injectable({
  providedIn: 'root',
})
export class ColumnService {
  constructor(private graphqlService: GraphqlService) { }

  async createColumn(body: CreateColumn) {
    const CREATE_COLUMN = gql`
      mutation CreateColumn($body: CreateColumn!) {
        createColumn(body: $body) {
          id
          description
          sequence
        }
      }
    `;

    return this.graphqlService.client.mutate({
      mutation: CREATE_COLUMN,
      variables: { body },
    });
  }

  async updateColumn(body: CreateColumn & { id: number }) {
    const UPDATE_COLUMN = gql`
      mutation UpdateColumn($body: UpdateColumn!) {
        updateColumn(body: $body) {
          id
          sequence
          description
        }
      }
    `;

    return this.graphqlService.client.mutate({
      mutation: UPDATE_COLUMN,
      variables: { body },
    });
  }

  async manyUpdateColumn(body: UpdateColumn[]) {
    const MANY_UPDATE_COLUMN = gql`
      mutation ManyUpdateColumn($body: [UpdateColumn!]!) {
        manyUpdateColumn(body: $body) {
          id
        }
      }
    `;

    return this.graphqlService.client.mutate({
      mutation: MANY_UPDATE_COLUMN,
      variables: { body },
    });
  }


  async deleteColumn(id: number) {
    const DELETE_COLUMN = gql`
      mutation DeleteColumn($deleteColumnId: Float!) {
        deleteColumn(id: $deleteColumnId) {
          id
        }
      }
    `;

    return this.graphqlService.client.mutate({
      mutation: DELETE_COLUMN,
      variables: { deleteColumnId: id },
    });
  }

  async getColumns() {
    const GET_COLUMNS = gql`
      query Columns {
        columns {
          id
          description
          sequence
          tasks {
            id
            description
            id_column
            sequence
          }
        }
      }
    `;

    return this.graphqlService.client.query({
      query: GET_COLUMNS,
      fetchPolicy: 'network-only',
    })
  }
}
