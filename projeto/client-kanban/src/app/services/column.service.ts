import { Injectable } from '@angular/core';
import { GraphqlService } from '../services/graphql.service';
import { gql } from '@apollo/client/core';
import { CreateColumn } from '../shared/models/column';

@Injectable({
  providedIn: 'root',
})
export class ColumnService {
  constructor(private graphqlService: GraphqlService) { }

  createColumn(body: CreateColumn) {
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
      update: (cache, { data }) => {
        const existingColumns: any = cache.readQuery({
          query: gql`
            query Columns {
              columns {
                id
                description
                sequence
                tasks {
                  id
                  description
                  sequence
                }
              }
            }
          `,
        });

        const newColumn = data.createColumn;
        cache.writeQuery({
          query: gql`
            query Columns {
              columns {
                id
                description
                sequence
                tasks {
                  id
                  description
                  sequence
                }
              }
            }
          `,
          data: {
            columns: [...existingColumns.columns, newColumn],
          },
        });
      },
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
            sequence
          }
        }
      }
    `;

    return this.graphqlService.client.query({
      query: GET_COLUMNS,
      fetchPolicy: 'network-only',
    }).then((response) => {
      console.log('Resposta da API:', response.data);
      return response;
    });
  }
}
