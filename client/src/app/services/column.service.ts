import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { map } from 'rxjs/operators';
import {
  CREATE_COLUMN,
  GET_ALL_COLUMNS,
  DELETE_COLUMN,
} from '../graphql/column-queries-mutations';

@Injectable({
  providedIn: 'root',
})
export class ColumnService {
  constructor(private apollo: Apollo) {}

  // Método para criar uma nova coluna
  createColumn(name: string, color: string) {
    return this.apollo
      .mutate<any>({
        mutation: CREATE_COLUMN,
        variables: { name, color },
        update: (cache, { data }) => {
          // Lê os dados do cache, que é a lista atual de colunas
          const existingColumns: any = cache.readQuery({
            query: GET_ALL_COLUMNS,
          });

          // Verifica se já existem colunas no cache
          if (existingColumns && existingColumns.getAllColumns) {
            // Obtém a nova coluna criada
            const newColumn = data?.createColumn; // Certifique-se de que está acessando a coluna corretamente

            // Atualiza o cache com a nova coluna
            cache.writeQuery({
              query: GET_ALL_COLUMNS,
              data: {
                getAllColumns: [...existingColumns.getAllColumns, newColumn], // Adiciona a nova coluna
              },
            });

            console.log('Colunas atualizadas no cache');
          } else {
            console.log('Nenhuma coluna encontrada no cache');
          }
        },
      })
      .pipe(
        map((result) => {
          return result.data; // Retorna os dados da mutação, se necessário
        })
      );
  }

  // Método para buscar todas as colunas
  getAllColumns() {
    return this.apollo
      .watchQuery({
        query: GET_ALL_COLUMNS,
      })
      .valueChanges.pipe(
        map((result: any) => {
          // Aqui usamos map para garantir que estamos apenas extraindo e formatando os dados corretamente
          return result.data.getAllColumns.map((column: any) => ({
            id: column.id,
            name: column.name,
            color: column.color,
          }));
        })
      );
  }

  // Método para deletar uma nova coluna
  deleteColumn(id: string) {
    return this.apollo.mutate<any>({
      mutation: DELETE_COLUMN,
      variables: { id },
      update: (cache) => {
        // Lê os dados do cache, que é a lista atual de colunas
        const existingColumns: any = cache.readQuery({
          query: GET_ALL_COLUMNS,
        });

        // Verifica se as colunas existem no cache
        if (existingColumns && existingColumns.getAllColumns) {
          const updatedColumns = existingColumns.getAllColumns.filter(
            (column: { id: string }) => column.id !== id
          );

          // Escreve a nova lista de colunas no cache
          cache.writeQuery({
            query: GET_ALL_COLUMNS,
            data: { getAllColumns: updatedColumns },
          });
          console.log('Colunas atualizadas no cache');
        } else {
          console.log('Nenhuma coluna encontrada no cache');
        }
      },
    });
  }
}
